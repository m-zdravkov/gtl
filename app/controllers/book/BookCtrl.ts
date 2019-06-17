import { Request } from 'express';
import { BookService } from '../../services/book/BookService';
import { getConnection } from '../../components/database/DbConnect';
import { DocBook } from '../../models/book/Book';
import { ErrorHandler } from '../../components/ErrorHandler';
import { DocBookCopy, BookCopy } from '../../models/book/BookCopy';
import { UserService } from '../../services/user/UserService';
import * as moment from 'moment';
import {returnPeriod} from '../../components/constants/models/book/bookConstants';
import { maxLoans } from '../../components/constants/models/user/userConstants';
import { BookCopyService } from '../../services/book/BookCopyService';
import { AuditService } from '../../services/audit/AuditService';
import { actionEnum, modelEnum } from '../../components/constants/models/audit/auditConstants';
import { IBookService } from '../../services/book/IBookService';
import { IUserService } from '../../services/user/IUserService';
import { IAuditService } from '../../services/audit/IAuditService';

export async function createBook(req: Request): Promise<DocBook> {
  const fName = 'BookCtrl.createBook';
  const reqBody = req.body;
  const db = await getConnection();
  const bookService = new BookService(db);
  let savedObject;
  try {
    savedObject = await bookService.create(reqBody).save();
  } catch (e) {
    throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
  }
  const auditService = new AuditService(db);
  auditService.createAudit(modelEnum.BOOK, actionEnum.CREATE, savedObject._id,
                           JSON.parse(JSON.stringify(savedObject)));
  return savedObject;
}

export async function getBooks(req: Request): Promise<DocBook[]> {
    const bookTitle = req.query.title;
    const bookAuthor = req.query.author;
    const bookSubject = req.query.subjectArea;

    const db = await getConnection();
    const bookService = new BookService(db);
    const auditService = new AuditService(db);
    auditService.createAudit(modelEnum.BOOK, actionEnum.LIST);
    return bookService.searchBooks(bookTitle, bookAuthor, bookSubject);
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
  const auditService = new AuditService(db);

  // Check if book and user exist
  const book = await bookService.findOne({ISBN: isbn}, undefined, {
    path: 'bookCopies',
    model: 'BookCopy'
  });
  if (!book) {
    throw ErrorHandler.handleErrDb(fName, 'Book ISBN not found');
  }

  const user = await userService.findOne({ssn: ssn});
  if (!user) {
    throw ErrorHandler.handleErrDb(fName, 'User SSN not found');
  }
  const oldUser = JSON.parse(JSON.stringify(user));

  if (book.lendingRestrictions && book.lendingRestrictions.length > 0) {
    throw ErrorHandler.handleErrValidation(fName, 'Book is restricted');
  }

  // Check that user has loaned less than 5 books
  if (user.takenBooks && user.takenBooks.length >= maxLoans) {
    throw ErrorHandler.handleErrValidation(fName, `User can not loan more than ${maxLoans} books`);
  }

  // Find one available copy from the Book
  book.bookCopies = book.bookCopies as BookCopy[];
  const copy = book.bookCopies.find(k => {
    k = k as BookCopy;
    return k.available;
  }) as DocBookCopy;

  if (!copy) {
    throw ErrorHandler.handleErrDb(fName, 'No copies are available');
  }
  const oldCopy = JSON.parse(JSON.stringify(copy));

  // Assign loan
  copy.available = false;
  copy.takenDate = moment();
  copy.expectedReturnDate = moment()
    .add(returnPeriod[user.userType].period, returnPeriod[user.userType].unit);
  user.takenBooks.push(copy);

  try {
    const savedUser = await user.save();
    auditService.createAudit(modelEnum.USER, actionEnum.UPDATE, user._id, savedUser, oldUser);
    const savedCopy = await copy.save();
    auditService.createAudit(modelEnum.BOOK_COPY, actionEnum.LOAN_BOOK,
                             copy._id, savedCopy, oldCopy);
    return savedCopy;
  } catch (e) {
    throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
  }
}

export async function loanBookWithDependencies(
  req: Request, bookService: IBookService, userService: IUserService,
  auditService: IAuditService): Promise<DocBookCopy> {

  const fName = 'BookCtrl.loanBook';
  const isbn = req.params.isbn;
  const ssn = req.body.ssn;

  // Check if book and user exist
  const book = await bookService.findOne({ISBN: isbn}, undefined, {
    path: 'bookCopies',
    model: 'BookCopy'
  });
  if (!book) {
    throw ErrorHandler.handleErrDb(fName, 'Book ISBN not found');
  }

  const user = await userService.findOne({ssn: ssn});
  if (!user) {
    throw ErrorHandler.handleErrDb(fName, 'User SSN not found');
  }
  const oldUser = JSON.parse(JSON.stringify(user));

  if (book.lendingRestrictions && book.lendingRestrictions.length > 0) {
    throw ErrorHandler.handleErrValidation(fName, 'Book is restricted');
  }

  // Check that user has loaned less than 5 books
  if (user.takenBooks && user.takenBooks.length >= maxLoans) {
    throw ErrorHandler.handleErrValidation(fName, `User can not loan more than ${maxLoans} books`);
  }

  // Find one available copy from the Book
  book.bookCopies = book.bookCopies as BookCopy[];
  const copy = book.bookCopies.find(k => {
    k = k as BookCopy;
    return k.available;
  }) as DocBookCopy;

  if (!copy) {
    throw ErrorHandler.handleErrDb(fName, 'No copies are available');
  }
  const oldCopy = JSON.parse(JSON.stringify(copy));

  // Assign loan
  copy.available = false;
  copy.takenDate = moment();
  console.log(returnPeriod);
  console.log(user);
  copy.expectedReturnDate = moment()
    .add(returnPeriod[user.userType].period, returnPeriod[user.userType].unit);
  user.takenBooks.push(copy);

  try {
    const savedUser = await user.save();
    auditService.createAudit(modelEnum.USER, actionEnum.UPDATE, user._id, savedUser, oldUser);
    const savedCopy = await copy.save();
    auditService.createAudit(modelEnum.BOOK_COPY, actionEnum.LOAN_BOOK,
      copy._id, savedCopy, oldCopy);
    return savedCopy;
  } catch (e) {
    throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
  }
}


export async function createBookCopy(req: Request): Promise<DocBookCopy> {
    const fName = 'BookCtrl.createBookCopy';
    const db = await getConnection();
    const bookCopyService = new BookCopyService(db);
    const bookService = new BookService(db);
    let savedObject;

    const book = await bookService.findOne({ISBN: req.params.isbn});
    if (!book) {
      throw ErrorHandler.handleErrDb(fName, 'Book ISBN does not exist');
    }
    const copy = new BookCopy(true, moment(), book._id);

    try {
        savedObject = await bookCopyService.create(copy).save();
        book.bookCopies.push(savedObject._id);
        await book.save();
    } catch (e) {
        throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
    }
    const auditService = new AuditService(db);
    auditService.createAudit(modelEnum.BOOK_COPY, actionEnum.CREATE, savedObject._id,
                             JSON.parse(JSON.stringify(savedObject)));
    return savedObject;
}

export async function countAvailableCopies(req: Request): Promise<any> {
    const fName = 'BookCtrl.countAvailableCopies';
    const db = await getConnection();
    const bookService = new BookService(db);

    const book: DocBook = await bookService.findOne({ISBN: req.params.isbn}, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    if (!book) {
      throw ErrorHandler.handleErrDb(fName, 'Book ISBN does not exist');
    }
    const res = await bookService.countAvailableCopies(book.ISBN);
    const auditService = new AuditService(db);
    auditService.createAudit(modelEnum.BOOK, actionEnum.FIND_COPIES, book._id);
    return res && res.length > 0 ? res[0] : { count: 0 };
}
export async function setBookCopyStatus(req: Request): Promise<DocBookCopy> {
  const fName = 'BookCtrl.setBookCopyStatus';
  const db = await getConnection();
  const bookCopyService = new BookCopyService(db);
  let oldBookCopy;
  const bookCopy = await bookCopyService.findById(req.params.copyId);
  if (!bookCopy) {
    throw ErrorHandler.handleErrDb(fName, 'Book copy was not found');
  }
  oldBookCopy = JSON.parse(JSON.stringify(bookCopy));
  bookCopy.status = req.body.status;
  const savedCopy = await bookCopy.save();

  const auditService = new AuditService(db);
  auditService.createAudit(modelEnum.BOOK_COPY, actionEnum.UPDATE, bookCopy._id,
                           JSON.parse(JSON.stringify(savedCopy)), oldBookCopy);
  return bookCopy;
}


export async function countAllBookCopies(req: Request): Promise<any> {
  const fName = 'BookCtrl.countAllBookCopies';
  const db = await getConnection();
  const bookService = new BookService(db);
  const auditService = new AuditService(db);

  const book = await bookService.findOne({ISBN: req.params.isbn});
  if (!book) {
    throw ErrorHandler.handleErrDb(fName, 'Book ISBN does not exist');
  }

  auditService.createAudit(modelEnum.BOOK, actionEnum.FIND_COPIES, book._id);
  return { count: book.bookCopies.length };
}
