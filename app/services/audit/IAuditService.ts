import { DocAudit, LeanAudit } from '../../models/audit/Audit';
import { actionEnum, modelEnum } from '../../components/constants/models/audit/auditConstants';
import { ObjectId } from '../../models/BaseModel';
import { IBaseService } from '../IBaseService';

export interface IAuditService extends IBaseService<LeanAudit, DocAudit> {

  createAudit(model: modelEnum, action: actionEnum, modelId?: ObjectId, newObject?: Object,
                    oldObject?: Object, librarianId?: ObjectId): Promise<DocAudit>;
  getAverageLoanTime(): Promise<{ avgLoanTimeDays: number, avgLoanTimeHours: number }[]>;
}
