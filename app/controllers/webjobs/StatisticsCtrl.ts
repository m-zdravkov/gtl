import { Request} from 'express';
import { getConnection } from '../../components/database/DbConnect';
import { AuditService } from '../../services/audit/AuditService';
import {Book} from '../../models/book/Book';

export async function getAverageLoanTime(req: Request): Promise<any> {
  const db = await getConnection();
  const auditService = new AuditService(db);

  const loanStatistics = await auditService.getAverageLoanTime();
  return loanStatistics;
}

export async function getMostLoanedBook(req: Request): Promise<{loanTimes: number, book: Book}> {
    const db = await getConnection();
    const auditService = new AuditService(db);
    return auditService.getMostLoanedBook();
}
