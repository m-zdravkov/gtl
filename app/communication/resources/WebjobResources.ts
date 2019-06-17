import { defaultCtrlCall } from './UtilResources';
import { Router } from 'express';
import { sendAllNotifications } from '../../controllers/webjobs/NotificationCtrl';
import { seedDatabase } from '../../components/database/Seeder';
import {
    getAverageLoanTime as getAlt,
    getMostLoanedBook
} from '../../controllers/webjobs/StatisticsCtrl';

export function sendNotifications(router: Router): void {
  router.get('/webjobs/notifications/send', (req, res) => {
    return defaultCtrlCall(res, sendAllNotifications, req);
  });

  router.get('/webjobs/seed', (req, res) => {
    return defaultCtrlCall(res, seedDatabase, req);
  });
}

export function getAverageLoanTime(router: Router): void {
  router.get('/webjobs/statistics/averageloantime', (req, res) => {
    return defaultCtrlCall(res, getAlt, req);
  });
  router.get('/webjobs/statistics/mostLoanedBook', (req, res) => {
    return defaultCtrlCall(res, getMostLoanedBook, req);
  });
}
