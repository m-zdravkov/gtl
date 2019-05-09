import { defaultCtrlCall } from './UtilResources';
import { createBook } from '../../controllers/book/BookCtrl';
import { Request, Response } from 'express';

module.exports = (router: any) => {

  // View compliance data
  router.post(
    '/books',
    (req: Request, res: Response) => {
      return defaultCtrlCall(res, createBook, req);
    });
};
