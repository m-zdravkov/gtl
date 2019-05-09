import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { DocUser, LeanUser } from '../../models/user/User';

export class UserService extends BaseService<LeanUser, DocUser> {
  constructor(db: Connection) {
    super('User', db);
  }
}
