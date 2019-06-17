import { DocBook, LeanBook } from '../../models/book/Book';
import { IBaseService } from '../IBaseService';

export interface IBookService extends IBaseService<LeanBook, DocBook> {
  countAvailableCopies(isbn: string): Promise<{count: number}[]>;
}
