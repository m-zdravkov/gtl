import { defaultCtrlCall } from './UtilResources';
import {createBook, getBooks, loanBook} from '../../controllers/book/BookCtrl';
import { Request, Response } from 'express';

module.exports = (router: any) => {

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
  router.put(
    '/books/:isbn/loan',
    (req: Request, res: Response) => {
      return defaultCtrlCall(res, loanBook, req);
    });
};
