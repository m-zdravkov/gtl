import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { Audit, DocAudit, LeanAudit } from '../../models/audit/Audit';
import moment = require('moment');
import { actionEnum, modelEnum } from '../../components/constants/models/audit/auditConstants';
import { ObjectId } from '../../models/BaseModel';

export class AuditService extends BaseService<LeanAudit, DocAudit> {

  async createAudit(model: modelEnum, action: actionEnum, modelId?: ObjectId, newObject?, oldObject?,
                     librarianId?: ObjectId) {
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
    await this.create(audit).save()
  }

  constructor(db: Connection) {
    super('Audit', db);
  }
}
