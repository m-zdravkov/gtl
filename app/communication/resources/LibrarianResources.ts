import {Request, Response, Router} from 'express';
import {defaultCtrlCall} from './UtilResources';
import {createLibrarian, getLibrarians} from '../../controllers/librarian/LibrarianCtrl';

module.exports = (router: Router) => {
    router.get(
        '/librarians',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, getLibrarians, req);
        });
    router.post(
        '/librarians',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, createLibrarian, req);
        });
};
