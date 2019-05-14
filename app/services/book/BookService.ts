import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { DocBook, LeanBook } from '../../models/book/Book';

export class BookService extends BaseService<LeanBook, DocBook> {
  constructor(db: Connection) {
    super('Book', db);
  }

  async countAvailableCopies(isbn: string): Promise<any[]> {
    return this.mongoService.getModel('Book')
      .aggregate()
      .match({
        bookCopies: {
          $exists: true,
        }
      })
      .lookup({
        from: 'bookcopies',
        localField: 'bookCopies',
        foreignField: '_id',
        as: 'bookCopy'
      })
      .match({
        'bookCopy.available': true
      })
      .project({
        availableCopies: { $count: 'availableCopies' }
      })
      .exec();
  }
}
