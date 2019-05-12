import { defaultCtrlCall } from './UtilResources';
import { createBook, getBooks, loanBook, getBook } from '../../controllers/book/BookCtrl';
import { Request, Response, Router } from 'express';

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
};
