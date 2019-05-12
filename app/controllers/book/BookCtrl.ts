import { Request } from 'express';
import { BookService } from '../../services/book/BookService';
import { getConnection } from '../../components/database/DbConnect';
import { DocBook } from '../../models/book/Book';
import { ErrorHandler } from '../../components/ErrorHandler';
import { DocBookCopy, BookCopy } from '../../models/book/BookCopy';
import { UserService } from '../../services/user/UserService';
import { DocUser } from '../../models/user/User';
import * as moment from 'moment';
import { returnPeriodDays } from '../../components/constants/models/book/bookConstants'
import { maxLoans } from '../../components/constants/models/user/userConstants';
import { BookCopyService } from '../../services/book/BookCopyService';

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

export async function getBook(req: Request): Promise<DocBook> {
    const db = await getConnection();
    const bookService = new BookService(db);
    return bookService.findOne({ISBN: req.params.isbn});
}

export async function loanBook(req: Request): Promise<DocBookCopy> {
  const fName = 'BookCtrl.loanBook';
  const isbn = req.params.isbn;
  const ssn = req.body.ssn;

  const db = await getConnection();
  const bookService = new BookService(db);
  const userService = new UserService(db);

  // Check if book and user exist
  const book: DocBook = await bookService.findOne({ISBN: isbn}, undefined, 'bookCopies');
  await book.populate('bookCopies').execPopulate();
  if (!book) {
    throw ErrorHandler.handleErrDb(fName, 'Book ISBN not found');
  }

  const user: DocUser = await userService.findOne({ssn: ssn});
  if (!user) {
    throw ErrorHandler.handleErrDb(fName, 'User SSN not found');
  }

  if (book.lendingRestrictions.length > 0) {
    throw ErrorHandler.handleErrValidation(fName, 'Book is restricted');
  }

  // Check that user has loaned less than 5 books
  if (user.takenBooks.length >= maxLoans) {
    throw ErrorHandler.handleErrValidation(fName, `User can not loan more than ${maxLoans} books`);
  }

  // Find one available copy
  book.bookCopies = book.bookCopies as BookCopy[];
  const bookCopyService = new BookCopyService(db);
  throw ErrorHandler.handleErrDb(fName, `EBI SI MAIKATA:\n${JSON.stringify(book)}\n${JSON.stringify(bookCopyService.find({}))}`);
  const copy: DocBookCopy = book.bookCopies.find(k => {
    k = k as BookCopy;
    // throw ErrorHandler.handleErrDb(fName, 'EBI SI MAIKATA: ' + (k.available));
    return k.available;
  }) as DocBookCopy;

  if (!copy) {
    throw ErrorHandler.handleErrDb(fName, 'No copies are available');
  }

  // Assign loan
  copy.available = false;
  copy.takenDate = moment();
  copy.expectedReturnDate = moment().add(returnPeriodDays, 'days');
  user.takenBooks.push(copy);

  try {
    await user.save();
    return copy.save();
  } catch (e) {
    throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
  }
}
