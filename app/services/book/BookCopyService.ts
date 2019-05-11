import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { DocBookCopy, LeanBookCopy } from '../../models/book/BookCopy';

export class BookCopyService extends BaseService<LeanBookCopy, DocBookCopy> {
  constructor(db: Connection) {
    super('BookCopy', db);
  }
}
