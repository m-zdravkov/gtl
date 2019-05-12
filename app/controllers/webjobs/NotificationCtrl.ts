import { Request} from 'express';
import { getConnection } from '../../components/database/DbConnect';
import { UserService } from '../../services/user/UserService';
import { DocBookCopy } from '../../models/book/BookCopy';
import { userGracePeriodDays } from '../../components/constants/models/user/userConstants';
import { DocUser } from '../../models/user/User';
import * as moment from 'moment';
import { sendMail } from '../../components/helpers/Mail';
import { notificationConstats } from '../../components/constants/notifications/notificationConstants'
import { DocBook } from '../../models/book/Book';
import { BookCopyService } from '../../services/book/BookCopyService';

export async function sendAllNotifications (req: Request): Promise<void> {
  const bookNotificationsPromise = sendBookNotifications(req);

  await Promise.all([bookNotificationsPromise]);
}

async function sendBookNotifications(req: Request): Promise<void> {
  const db = await getConnection();
  const userService = new UserService(db);
  const bookCopyService = new BookCopyService(db);
  const users = await userService.find(
    {
      takenBooks: {
        $exists: true,
        $not: { $size: 0 }
      }
    },
    'takenBooks userType', {
      path: 'takenBooks',
      model: 'BookCopy',
      populate: {
        path: 'bookId',
        model: 'Book'
      }
    });
  const promises = [];
  users.forEach(user => {
    let changedFlag = false;
    user = user as DocUser;
    const userGraceDays = userGracePeriodDays[user.userType];
    user.takenBooks = user.takenBooks as DocBookCopy[];
    user.takenBooks.forEach(bookCopy => {
      bookCopy = bookCopy as DocBookCopy;
      bookCopy.bookId = bookCopy.bookId as DocBook;
      if (moment(bookCopy.expectedReturnDate).add(userGraceDays, 'days').isBefore(moment()) &&
        !bookCopy.reminderSent) {
        changedFlag = true;
        const content = notificationConstats.email.BOOK_OVERDUE.content
          .replace('<bookTitle>', bookCopy.bookId.title)
          .replace('<ISBN>', bookCopy.bookId.ISBN);
        promises.push(
          sendMail(user.mailingAddress, content, notificationConstats.email.BOOK_OVERDUE.subject));
        bookCopy.reminderSent= true;
        promises.push(bookCopyService.update({_id: bookCopy._id}, {$set: {reminderSent: true}}))
      }
    });
  });
  await Promise.all(promises);
}

