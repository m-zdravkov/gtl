import { constants } from './constants';

type GTLError = {
  msg: string,
  type: string,
  code: number,
  inner: any
};

export class ErrorHandler {

  static handleErr(functionName: string, msg: string, type: string,
                   code: number, inner?: any): GTLError {
    if (functionName) {
      if (inner) {
        if (typeof inner === 'object' && inner.code) {
          this.handleErr(functionName, inner.msg, inner.type, inner.code, inner.inner);
        }
      }
    }
    return {
      msg: msg,
      type: type,
      code: code,
      inner: inner
    };
  }

  static handleErrQueryfunction(functionName: string, msg: string, inner?: any): GTLError {
    return this.handleErr(functionName, msg, constants.errType.QUERY, 400, inner);
  }

  static handleErrorPrecondition(functionName: string, msg: string, inner?: any): GTLError  {
    return this.handleErr(functionName, msg, constants.errType.PRECONDITION, 400, inner);
  }

  static handleErrDb(functionName: string, msg: string, inner?: any): GTLError  {
    return this.handleErr(functionName, msg, constants.errType.DB, 400, inner);
  }

  static handleErrRestriction(functionName: string, msg: string, inner?: any): GTLError  {
    return this.handleErr(functionName, msg, constants.errType.RESTRICTION, 400, inner);
  }

  static handleErrValidation(functionName: string, msg: string, inner?: any): GTLError  {
    return this.handleErr(functionName, msg, constants.errType.VALIDATION, 400, inner);
  }

  static handleErrSecurity(functionName: string, msg: string, inner?: any): GTLError  {
    return this.handleErr(functionName, msg, constants.errType.SECURITY, 403, inner);
  }

  static handleErrUnknown(functionName: string, msg: string, inner?: any): GTLError  {
    return this.handleErr(functionName, msg, constants.errType.UNKNOWN, 400, inner);
  }
}
