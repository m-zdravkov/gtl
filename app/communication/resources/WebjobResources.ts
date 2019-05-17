import { defaultCtrlCall } from './UtilResources';
import { Router } from 'express';
import { sendAllNotifications } from '../../controllers/webjobs/NotificationCtrl';
import { getAverageLoanTime as getAlt } from '../../controllers/webjobs/StatisticsCtrl';

export function sendNotifications(router: Router): void {
  router.get('/webjobs/notifications/send', (req, res) => {
    return defaultCtrlCall(res, sendAllNotifications, req);
  });
}

export function getAverageLoanTime(router: Router): void {
  router.get('/webjobs/statistics/averageloantime', (req, res) => {
    return defaultCtrlCall(res, getAlt, req);
  });
}
