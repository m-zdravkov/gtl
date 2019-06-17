import { DocUser, LeanUser } from '../../models/user/User';
import { BookCopyService } from '../book/BookCopyService';
import { IBaseService } from '../IBaseService';

export interface IUserService extends IBaseService<LeanUser, DocUser> {

  getNotificationUsersMemberCard(): Promise<DocUser[]>;

  sendNotificationsForMemberCardExpiration(): Promise<void>;

  sendOverdueBookNotifications(bookCopyService: BookCopyService): Promise<void>;

  getNotificationUsersBookOverdue(): Promise<any[]>;
}

