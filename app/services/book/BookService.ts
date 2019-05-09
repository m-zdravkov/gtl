import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { DocBook, LeanBook } from '../../models/book/Book';

export class BookService extends BaseService<LeanBook, DocBook> {
  constructor(db: Connection) {
    super('Book', db);
  }
}
