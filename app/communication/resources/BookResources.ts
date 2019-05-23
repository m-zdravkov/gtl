import {defaultCtrlCall} from './UtilResources';
import {
  createBook,
  getBooks,
  loanBook,
  getBook,
  createBookCopy,
  countAllBookCopies,
  countAvailableCopies,
  setBookCopyStatus, loanBookWithDependencies
} from '../../controllers/book/BookCtrl';
import {Request, Response, Router} from 'express';
import { BookService } from '../../services/book/BookService';
import { UserService } from '../../services/user/UserService';
import { AuditService } from '../../services/audit/AuditService';

module.exports = (router: Router) => {

    // View compliance data
    router.post(
        '/books',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, createBook, req);
        });
    router.get(
        '/books',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, getBooks, req);
        });
    router.get(
        '/books/:isbn',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, getBook, req);
        });
    router.put(
        '/books/:isbn/loan',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, loanBook, req);
        });
    router.put(
        '/books/:isbn/loanBook',
      (req: Request, res: Response) => {
          const connection = global.db;
          const bookService = new BookService(connection);
          const userService = new UserService(connection);
          const auditService = new AuditService(connection);
          return defaultCtrlCall(res, loanBookWithDependencies, req, bookService, userService, auditService);
        });
    router.post(
        '/books/:isbn/copies',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, createBookCopy, req);
        });
    router.get('/books/:isbn/copies/count',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, countAvailableCopies, req);
        });
    router.get(
        '/books/:isbn/copies/countall',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, countAllBookCopies, req);
        });
    router.put(
        '/books/:isbn/copies/:copyId',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, setBookCopyStatus, req);
        });
};
