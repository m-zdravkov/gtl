import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { DocBook, LeanBook } from '../../models/book/Book';

export class BookService extends BaseService<LeanBook, DocBook> {
  constructor(db: Connection) {
    super('Book', db);
  }

  async countAvailableCopies(isbn: string): Promise<{count: number}[]> {
    return this.mongoService.getModel('Book')
      .aggregate()
      .match({
        $and: [
          { ISBN: isbn },
          {
            bookCopies: {
              $exists: true,
            }
          }
        ]
      })
      .lookup({
        from: 'bookcopies',
        localField: 'bookCopies',
        foreignField: '_id',
        as: 'bookCopy'
      })
      .unwind('bookCopy')
      .match({
        'bookCopy.available': true
      })
      .group({
        _id: '$bookCopy.available',
        count: {$sum: 1}
      })
      .project({
        _id: 0
      })

      .exec();
  }
}
