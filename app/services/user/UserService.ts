import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { DocUser, LeanUser } from '../../models/user/User';
import moment = require('moment');
import {
  userGracePeriodDays,
  userTypesEnum
} from '../../components/constants/models/user/userConstants';
import { notificationConstats } from '../../components/constants/notifications/notificationConstants';
import { sendMail } from '../../components/helpers/Mail';
import { DocCampus } from '../../models/campus/Campus';
import { ErrorHandler } from '../../components/ErrorHandler';
import { BookCopyService } from '../book/BookCopyService';
import { ObjectId } from '../../models/BaseModel';

export class UserService extends BaseService<LeanUser, DocUser> {
  constructor(db: Connection) {
    super('User', db);
  }

  /**
   * Finds all users that the current date is past the notificationDate and
   * notification is not sent
   */
  async getNotificationUsersMemberCard() {
    return this.find({
      $and: [
        {'memberCard.isNotificationSent': false},
        {'memberCard.notificationSendoutDate': {$lt: moment()}},
      ]
    })
  }

  /**
   * Sends notifications to all users who have overdue book copies in them
   */
  async sendOverdueBookNotifications(bookCopyService: BookCopyService): Promise<void> {
    const aggregatedResult = await this.getNotificationUsersBookOverdue();
    const fName = 'UserService.sendOverdueBookNotifications';
    const bookCopyIdsReminderSent: ObjectId[] = [];
    const promises = [];
    aggregatedResult.forEach(aR => {
      const user = aR.user;
      user.book = user.book[0];
      user.campus = user.campus[0];
      const userGraceDays = userGracePeriodDays[user.userType];
      if (moment(user.takenBook.expectedReturnDate).add(userGraceDays, 'days').isBefore(moment())) {
        const content = notificationConstats.email.BOOK_OVERDUE[ user.userType ].content
          .replace('<bookTitle>', user.book.title)
          .replace('<professorEmail>', user.mailingAddress)
          .replace('<ISBN>', user.book.ISBN);
        switch (user.userType) {
          case userTypesEnum.PROFESSOR:
            promises.push(sendMail((user.campus as DocCampus).address, content, notificationConstats.email.BOOK_OVERDUE[ user.userType ].subject));
            break;
          case userTypesEnum.NORMAL_USER:
            promises.push(sendMail(user.mailingAddress, content, notificationConstats.email.BOOK_OVERDUE[ user.userType ].subject));
            break;
          default:
            throw ErrorHandler.handleErrValidation(fName, 'User type does not exist');
        }
        bookCopyIdsReminderSent.push(user.takenBook._id)
      }
    });
    promises.push(
      bookCopyService.updateMany({ _id: { $in: bookCopyIdsReminderSent }},
        { $set: { reminderSent: true } }, {multi: true} ));
    await Promise.all(promises);
  }

  /**
   * Returns all users that have overdue books in them
   */
  async getNotificationUsersBookOverdue(): Promise<any[]> {

    return this.mongoService.getModel('User')
      .aggregate()
      .match({
        takenBooks: {
          $exists: true,
          $not: {$size: 0}
        }
      })
      .lookup({
        from: 'bookcopies',
        localField: 'takenBooks',
        foreignField: '_id',
        as: 'takenBook'
      })
      .lookup({
        from: 'books',
        localField: 'takenBook.bookId',
        foreignField: '_id',
        as: 'book'
      })
      .lookup({
        from: 'campus',
        localField: 'campus',
        foreignField: '_id',
        as: 'campus'
      })
      .unwind('takenBook')
      .match({
        $and: [
          {
            $or: [
              { 'takenBook.reminderSent': { $exists: false } },
              { 'takenBook.reminderSent': false }
            ]
          },
          {
            'takenBook.expectedReturnDate': {
              $lt: moment()
                .subtract(userGracePeriodDays[userGracePeriodDays.NORMAL_USER], 'days').toDate()
            }
          }
        ]
      })
      .project({
        user: '$$ROOT'
      })
      .exec()
  }
}

