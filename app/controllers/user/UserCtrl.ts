import { Request } from 'express';
import { UserService } from '../../services/user/UserService';
import { getConnection } from '../../components/database/DbConnect';
import { DocUser } from '../../models/user/User';
import { ErrorHandler } from '../../components/ErrorHandler';
import { AuditService } from '../../services/audit/AuditService';
import { actionEnum, modelEnum } from '../../components/constants/models/audit/auditConstants';

export async function createUser(req: Request): Promise<DocUser> {
  const fName = 'UserCtrl.createUser';
  const reqBody = req.body;
  const db = await getConnection();
  const userService = new UserService(db);
  let savedObject;
  try {
    savedObject = userService.create(reqBody).save();
  } catch (e) {
    throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
  }
  const auditService = new AuditService(db);
  auditService.createAudit(modelEnum.USER, actionEnum.CREATE, savedObject._id, savedObject);
  return savedObject;
}

export async function getUser(req: Request): Promise<DocUser> {
  const fName = 'UserCtrl.getUser';
  if (req.query.ssn) {
    const queryUser: {
      ssn: string;
    } = {
      ssn: req.query.ssn
    };
    let user ;
    const db = await getConnection();
    const userService = new UserService(db);
    user = userService.findOne(queryUser);
    const auditService = new AuditService(db);
    auditService.createAudit(modelEnum.USER, actionEnum.FIND, user._id);
    return user;
  } else {
    throw ErrorHandler.handleErrorPrecondition(fName, 'Missing parameter ssn');
  }
}

export async function updateUser(req: Request): Promise<DocUser> {
  const fName = 'UserCtrl.updateUser';
  const db = await getConnection();
  const userService = new UserService(db);

  let user = req.body;
  let oldssn;

  if (req.body.oldssn) {
    oldssn = user.oldssn;
  } else {
    oldssn = user.ssn;
  }

  const existingUser = await userService.findOne({ssn: oldssn});

  Object.keys(req.body).map(key => {
    existingUser[key] = req.body[key];
  });

  await existingUser.save();
  return userService.findOne({ssn: user.ssn});
}
