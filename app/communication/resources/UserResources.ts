import { defaultCtrlCall } from './UtilResources';
import { Router } from 'express';
import { createUser, getUser } from '../../controllers/user/UserCtrl';

export function userHandler(router: Router): void {
    router.post('/users', (req, res) => {
        return defaultCtrlCall(res, createUser, req);
    });

    router.get('/users', (req, res) => {
        return defaultCtrlCall(res, getUser, req);
    });
}
