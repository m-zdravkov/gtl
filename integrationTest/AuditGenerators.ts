require('./../app/components/helpers/ArrayExtensions');
import { Audit, DocAudit } from '../app/models/audit/Audit';
import { getConnection } from '../app/components/database/DbConnect';
import { AuditService } from '../app/services/audit/AuditService';
import { modelEnum, actionEnum } from '../app/components/constants/models/audit/auditConstants';
import * as moment from 'moment';
import { BookCopy, DocBookCopy } from '../app/models/book/BookCopy';
import { DocBook } from '../app/models/book/Book';
import { createBookCopy } from './CommonIntegrationGenerators';

/**
 * Creates an Audit for a returned book copy, plus the copy itself,
 * but WITHOUT the user information. This method generates a return period
 * of (today minus @param days) until today, so a copy is never returned overdue.
 * @param book The book type for which the loan was made
 * @param days The amount of days the book copy was loaned for
 */
export async function createReturnBookPeriodAudit(book: DocBook, days: number): Promise<DocAudit> {
  const db = await getConnection();
  const auditService = new AuditService(db);

  const copy: DocBookCopy = await createBookCopy(book);
  copy.takenDate = moment().subtract(days, 'days');
  await copy.save();

  return auditService.createAudit(modelEnum.BOOK_COPY, actionEnum.RETURN_BOOK, copy._id,
                                  copy, copy);
}
