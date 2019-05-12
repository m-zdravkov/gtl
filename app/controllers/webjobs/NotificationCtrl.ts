import { Request} from 'express';
import { getConnection } from '../../components/database/DbConnect';
import { UserService } from '../../services/user/UserService';
import { BookCopyService } from '../../services/book/BookCopyService';

export async function sendAllNotifications (req: Request): Promise<void> {
  const bookNotificationsPromise = sendBookNotifications(req);
  const memberCardNotifications = sendMembershipCardsNotifications(req);

  await Promise.all([bookNotificationsPromise, memberCardNotifications]);
}

export async function sendBookNotifications(req: Request): Promise<void> {
  const db = await getConnection();
  const userService = new UserService(db);
  const bookCopyService = new BookCopyService(db);
  await userService.sendOverdueBookNotifications(bookCopyService);
}

export async function sendMembershipCardsNotifications(req: Request): Promise<void> {
  const db = await getConnection();
  const userService = new UserService(db);
  await userService.sendNotificationsForMemberCardExpiration();
}

