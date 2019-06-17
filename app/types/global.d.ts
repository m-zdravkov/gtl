import {Connection} from 'mongoose';

declare global {
  namespace NodeJS {
    interface Global {
      masterDbReady: boolean;
      masterDbInit: boolean;
      db: Connection;
      currCon: Connection;
    }
  }
}
