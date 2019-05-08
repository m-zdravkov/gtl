import * as moment from 'moment';

export class Logger {
  private readonly baseMessage: string;

  constructor(baseMessage?: string) {
    this.baseMessage = baseMessage;
    if (!this.baseMessage) {
      this.baseMessage = '';
    }
  }

  logMsg(message: string): void {
    console.log(`${moment().format()} - ${this.baseMessage} ${message}`);
  }

  logErr(err: any): void {
    console.error(`${moment().format()} - ${this.baseMessage} ${err}`);
  }
}
