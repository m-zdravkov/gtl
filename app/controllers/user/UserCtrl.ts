import { Request } from 'express';
import { UserService } from '../../services/user/UserService';
import { getConnection } from '../../components/database/DbConnect';
import { DocUser } from '../../models/user/User';
import { ErrorHandler } from '../../components/ErrorHandler';
import { stringify } from 'querystring';

export async function createUser(req: Request): Promise<DocUser> {
  const fName = 'UserCtrl.createUser';
  const reqBody = req.body;
  const db = await getConnection();
  const userService = new UserService(db);
  try {
    return userService.create(reqBody).save();
  } catch (e) {
    throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
  }
}

export async function getUser(req: Request): Promise<DocUser> {
  const fName = 'UserCtrl.getUser';

  const queryUser: {
    ssn: string;
  } = {
    ssn: req.query.ssn
  };

  const db = await getConnection();
  const userService = new UserService(db);

  try {
    return userService.findOne(queryUser);
  } catch (e) {
    throw ErrorHandler.handleErrQueryfunction(fName, e.msg, e.inner);
  }
}
