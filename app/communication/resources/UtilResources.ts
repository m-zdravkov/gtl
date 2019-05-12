import { Response } from 'express';
import { config } from '../../components/config';
import { ErrorHandler } from '../../components/ErrorHandler';
import { Logger } from '../../components/logger/Logger';

export async function defaultCtrlCall(res: Response,
                                      method: Function, ...params: any[]): Promise<void> {
  try {
    const data = await method.apply(this, params);
    if (data) {
      res.send(data);
    } else {
      res.sendStatus(200);
    }
  } catch (err) {

    if (!config.database.production) {
      new Logger().logErr(JSON.stringify(err));
      if (err.inner) {
        new Logger().logErr(JSON.stringify(err.inner));
      }
    }

    if (!err.code) {
      err.code = 400;
    }

    if (isValidHttpStatusCode(err.code)) {
      res.status(err.code).send({type: err.type, msg: err.msg || err.message});
    } else {
      err = ErrorHandler.handleErrUnknown(method.name, err.message, err);
      res.sendStatus(err.code);
    }
  }
}

function isValidHttpStatusCode(code: number): boolean {
  return [100, 101, 102, 103, 104,
    200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 226, 227,
    300, 301, 302, 303, 304, 305, 306, 307, 308, 309,
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418,
    421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 451, 452,
    500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512]
      .includes(code);
}
