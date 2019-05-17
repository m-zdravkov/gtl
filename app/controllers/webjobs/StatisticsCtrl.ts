import { Request} from 'express';
import { getConnection } from '../../components/database/DbConnect';
import { AuditService } from '../../services/audit/AuditService';
import * as moment from 'moment';

export async function getAverageLoanTime(req: Request): Promise<any> {
  const db = await getConnection();
  const auditService = new AuditService(db);

  const loanStatistics = await auditService.getAverageLoanTime();
  return loanStatistics;
  // const days = moment(loanStatistics.totalTime).days();
  // return Promise.resolve(loanStatistics.returnedBooks / days);
}