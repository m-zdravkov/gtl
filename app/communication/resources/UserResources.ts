import { defaultCtrlCall } from './UtilResources';
import { Router } from 'express';
import { createUser } from '../../controllers/user/UserCtrl';

export function userHandler(router: Router): void {
    router.put('/users/updateUser', (req, res) => {
        return defaultCtrlCall(res, createUser, req);
    });
}
