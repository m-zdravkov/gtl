import { getConnection } from './database/DbConnect';
import { Logger } from './logger/Logger';

const moment = require('moment');
const constants = require('../components/Constants');

export class ErrorHandler {

  static async handleErr(functionName: string, msg: string, type: string,
                         code: number, inner?: any, noLogging?: boolean): Promise<void> {
    if (functionName && !noLogging) {
      if (!noLogging) {
        this.createErrorLog(functionName, `${type} ${msg}`);
      }
      if (inner) {
        if (typeof inner === 'object' && inner.code) {
          this.handleErr(functionName, inner.msg, inner.type, inner.code, inner.inner);
        } else {
          if (!noLogging) {
            this.createErrorLog(functionName, inner.message);
          }
        }
      }
    }
    throw {
      msg: msg,
      type: type,
      code: code,
      inner: inner
    };
  }

  /**
   * Creates an error log
   *
   * @param {String} functionName the function in question which results in an error
   * @param {String} message the error log message
   */
  static async createErrorLog(functionName: string, message: string): Promise<void> {
    const logger = new Logger();
    logger.logMsg(`${moment().format()} - ERROR: ${functionName} - ${message}`);
    const db: any = getConnection();
    const ErrorLog = db.model('ErrorLog');
    const errorLogModel = await ErrorLog.create({
      functionName: functionName,
      message: message, timeStamp: moment()
    });
    await errorLogModel.save();
    logger.logErr(errorLogModel);
  }

  static handleErrQueryfunction(functionName: string, msg: string, inner?: any): Promise<void> {
    return this.handleErr(functionName, msg, constants.errType.QUERY, 400, inner);
  }

  static handleErrorPrecondition(functionName: string, msg: string, inner?: any): Promise<void>  {
    return this.handleErr(functionName, msg, constants.errType.PRECONDITION, 400, inner);
  }

  static handleErrDb(functionName: string, msg: string, inner?: any): Promise<void>  {
    return this.handleErr(functionName, msg, constants.errType.DB, 400, inner);
  }

  static handleErrRestriction(functionName: string, msg: string, inner?: any): Promise<void>  {
    return this.handleErr(functionName, msg, constants.errType.RESTRICTION, 400, inner);
  }

  static handleErrSecurity(functionName: string, msg: string, inner?: any): Promise<void>  {
    return this.handleErr(functionName, msg, constants.errType.SECURITY, 403, inner);
  }

  static handleErrUnknown(functionName: string, msg: string, inner?: any): Promise<void>  {
    return this.handleErr(functionName, msg, constants.errType.UNKNOWN, 400, inner);
  }
}
