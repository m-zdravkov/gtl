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
              $exists: true
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
      .unwind('$bookCopy')
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

  async searchBooks(bookTitle: string, bookAuthor: string, subjectArea: string):
      Promise<DocBook[]> {
    let bookTitleArr = [];
    let bookAuthorArr = [];
    let subjectAreaArr = [];
    if (bookTitle) {
      bookTitleArr = bookTitle.split(' ').map(value => {
          return {title: {$regex: value, $options: 'i'}}; });
    }
    if (bookAuthor) {
      bookAuthorArr = bookAuthor.split(' ').map(value => {
          return {author: {$regex: value, $options: 'i'}}; });
    }
    if (subjectArea) {
      subjectAreaArr = subjectArea.split(' ').map(value => {
          return {subjectArea: {$regex: value, $options: 'i'}}; });
    }

    let searchArr = bookTitleArr.concat(bookAuthorArr, subjectAreaArr);
    if (searchArr.length < 1) {
      searchArr = [{}];
    }

    return this.mongoService.getModel('Book').aggregate().match({
          $and: searchArr
      }).exec();
  }

}
