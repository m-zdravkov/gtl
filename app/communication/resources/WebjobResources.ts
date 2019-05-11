import { defaultCtrlCall } from './UtilResources';
import { Router } from 'express';
import { sendAllNotifications } from '../../controllers/webjobs/NotificationCtrl';

export function sendNotifications(router: Router): void {
  router.get('/webjobs/notifications/send', (req, res) => {
    return defaultCtrlCall(res, sendAllNotifications, req);
  });
}
