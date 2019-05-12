import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { BookCopy, DocBookCopy, LeanBookCopy } from '../../models/book/BookCopy';

export class BookCopyService extends BaseService<LeanBookCopy, DocBookCopy> {
  constructor(db: Connection) {
    super('BookCopy', db);
  }

  async resetCopy(copy: DocBookCopy): Promise<DocBookCopy> {
    await copy.update({
      $set: {
        available: true,
      },
      $unset: {
        expectedReturnDate: '',
        reminderSent: '',
        takenDate: ''
      }
    });
    return this.findById(copy._id);
  }
}
