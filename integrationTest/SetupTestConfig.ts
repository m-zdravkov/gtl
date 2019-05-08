import { Logger } from '../app/components/logger/Logger';
import {
  config,
  setDevelopmentEnv,
  setIntegrationTestEnv,
  setUnitTestEnv
} from '../app/components/config';
const path = require('path');
const tcpPortUsed = require('tcp-port-used');
const exec = require('child-process-promise').exec;
const os = require('os');

setDevelopmentEnv();
setUnitTestEnv();
setIntegrationTestEnv();

after(stopMongodInstance);

function stopMongodInstance(): any {
  let dbPath = process.cwd();
  let dbPort = config.database.integrationTest.port;

  dbPath += path.normalize(config.database.integrationTest.path);
  return tcpPortUsed.check(dbPort, '127.0.0.1').then((inUse) => {
    if (inUse) {
      let command;
      if (os.platform() === 'linux') {
        command = '%mongod% --dbpath ' + dbPath + ' --shutdown';
      } else {
        command = '%mongo% --port ' + dbPort + ' --eval' +
          'db.getSiblingDB(\'admin\').shutdownServer()';
      }

      return exec(command);
    }
  }).then(() => {
    return tcpPortUsed.waitUntilFree(dbPort, 500, 30000);
  }).catch((err) => {
    new Logger('stopMongodInstance').logErr(err);
  });
}
