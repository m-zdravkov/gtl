require('../app/components/helpers/ArrayExtensions');
import { Logger } from '../app/components/logger/Logger';
import {
  config,
  setIntegrationTestEnv,

} from '../app/components/config';
const path = require('path');
const tcpPortUsed = require('tcp-port-used');
const exec = require('child-process-promise').exec;
const os = require('os');
setIntegrationTestEnv();

after(stopMongodInstance);

function stopMongodInstance(): any {
  let dbPort = config.database.integrationTest.port;


  return tcpPortUsed.check(dbPort, '127.0.0.1').then((inUse) => {
    if (inUse) {
      let command;
      if (os.platform() === 'linux') {
        command = 'mongo --port ' + dbPort + ' --eval "db.getSiblingDB(\'admin\').shutdownServer()"';
      } else {
        command = '%mongo% --port ' + dbPort +
          ' --eval db.getSiblingDB(\'admin\').shutdownServer()';
      }

      return exec(command);
    }
  }).then(() => {
    return tcpPortUsed.waitUntilFree(dbPort, 500, 30000);
  }).catch((err) => {
    new Logger('stopMongodInstance').logErr(err);
  });
}
