import { defaultCtrlCall } from './UtilResources';
import { Request, Response, Router } from 'express';
import { createUser, getUser, returnBook, updateUser } from '../../controllers/user/UserCtrl';

export function userHandler(router: Router): void {
    router.post('/users', (req, res) => {
        return defaultCtrlCall(res, createUser, req);
    });

    router.get('/users', (req, res) => {
        return defaultCtrlCall(res, getUser, req);
    });

    router.put('/users', (req, res) => {
        return defaultCtrlCall(res, updateUser, req);
    });
    router.put(
    '/users/:ssn/bookcopies/:bookCopyId/return',
    (req: Request, res: Response) => {
      return defaultCtrlCall(res, returnBook, req);
    });
}
