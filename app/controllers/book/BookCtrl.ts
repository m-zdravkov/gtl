import { Request } from 'express';
import { BookService } from '../../services/book/BookService';
import { getConnection } from '../../components/database/DbConnect';
import { DocBook } from '../../models/book/Book';
import { ErrorHandler } from '../../components/ErrorHandler';

export async function createBook(req: Request): Promise<DocBook> {
  const fName = 'BookCtrl.createBook';
  const reqBody = req.body;
  const db = await getConnection();
  const bookService = new BookService(db);
  try {
    return bookService.create(reqBody).save();
  } catch (e) {
    throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
  }
}

export async function getBooks(req: Request): Promise<DocBook[]> {
    const bookTitle = req.query.title;
    const bookAuthor = req.query.author;
    const bookSubject = req.query.subjectArea;
    const bookObject: {
        author?: string,
        title?: string,
        subjectArea?: string
    } = {};
    if (bookTitle) {
        bookObject.title = bookTitle;
    }
    if (bookAuthor) {
        bookObject.author = bookAuthor;
    }
    if (bookSubject) {
        bookObject.subjectArea = bookSubject;
    }
    const db = await getConnection();
    const bookService = new BookService(db);
    return bookService.find(bookObject);
}
