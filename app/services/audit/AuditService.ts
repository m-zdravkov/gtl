import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { Audit, DocAudit, LeanAudit } from '../../models/audit/Audit';
import moment = require('moment');
import { actionEnum, modelEnum } from '../../components/constants/models/audit/auditConstants';
import { ObjectId } from '../../models/BaseModel';

export class AuditService extends BaseService<LeanAudit, DocAudit> {

  async createAudit(model: modelEnum, action: actionEnum, modelId?: ObjectId, newObject?: Object,
                    oldObject?: Object, librarianId?: ObjectId): Promise<DocAudit> {
    const audit = new Audit();

    if (librarianId) {
      audit.librarianId = librarianId;
    }
    audit.createTime = moment();
    audit.model = model;
    audit.action = action;
    audit.modelId = modelId;
    if (oldObject) {
      audit.oldObject = oldObject;
    }
    if (newObject) {
      audit.newObject = newObject;
    }

    return this.create(audit).save();
  }

  constructor(db: Connection) {
    super('Audit', db);
  }

  async getAverageLoanTime(): Promise<{avgLoanTimeDays: number, avgLoanTimeHours: number}[]> {
    return this.mongoService.getModel('Audit')
      .aggregate()
      .match({
        $and: [
          { action: actionEnum.RETURN_BOOK },
          { model: modelEnum.BOOK_COPY },
          {
            'newObject.takenDate': { $exists: true }
          }
        ]
      })
      .project({
        createTime: 1,
        newObject: 1,
        loanTimeMs: {
          $subtract: [
            '$createTime',
            '$newObject.takenDate'
          ]
        }
      })
      .project({
        loanTimeMs: 1,
        loanTimeHours: {
          $floor: {
            $divide: [
              '$loanTimeMs',
              1000 * 60 * 60
            ]
          }
        }
      })
      .group({
        _id: 0,
        returnedBooks: { $sum: 1 },
        totalTime: { $sum: '$loanTimeHours' }
      })
      .project({
        _id: 0,
        returnedBooks: 1,
        totalTime: 1,
        avgLoanTimeHours: {
          $divide: [
            '$totalTime',
            '$returnedBooks'
          ]
        }
      })
      .project({
        returnedBooks: 1,
        totalTime: 1,
        avgLoanTimeHours: 1,
        avgLoanTimeDays: {
          $divide: [
            '$avgLoanTimeHours',
            24
          ]
        }
      })
      .exec();
  }
}
