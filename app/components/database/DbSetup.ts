import { spawn, exec } from 'child-process-promise';
import { config } from '../config';
import * as path from 'path';
import { check, waitUntilUsed, waitUntilFree } from 'tcp-port-used';
import { Logger } from '../logger/Logger';
import { getConnection, getUserlessAdminConnection } from './DbConnect';

import os = require('os');
import { Connection } from 'mongoose';
import * as fs from 'fs';

export async function dbSetup(): Promise<void> {
  const mode = Object.keys(config.modes).find(iMode => config.modes[ iMode ] === true);
  const logger = new Logger();

  let dbPath = process.cwd();
  let logPath = process.cwd();
  let dbPort = config.database[ mode ].port;
  let dbUri = config.database[ mode ].uri;

  dbPath += path.normalize(config.database[ mode ].path);
  logPath += path.normalize(config.database[ mode ].logPath);
  try {
    await stopMongodInstance(dbPort);
    await deleteTestDatabaseFiles(dbPath, mode);
    await initializeMongodInstance(dbPath, dbUri, dbPort, logPath);
    await initializeMasterDb(dbPort);
  } catch (err) {
    logger.logErr('-------- Mongod instance did NOT initialize correctly --------');
    return Promise.reject(err);
  }
}

/*  ------------------------ Helper Functions ------------------------*/
async function initializeMongodInstance(
  dbPath: string,
  dbUri: string,
  dbPort: number,
  logPath: string): Promise<void> {
  const portInUse = await check(dbPort, '127.0.0.1');
  if (!portInUse) {
    const options = {
      stdio: 'inherit',
      detached: true
    };
    if (!config.deleteDevelopmentDb && config.modes.development) {
      spawn(
        process.env.mongod, [
          '--dbpath', dbPath,
          '--port', dbPort,
          '--logpath', logPath,
          '--auth'
        ],
        options);
      await waitUntilUsed(dbPort, 500, 15000);
      new Logger().logMsg('-------- Mongod instance initialized successfully --------');
    } else {
      spawn(
        process.env.mongod, [
          '--dbpath', dbPath,
          '--port', dbPort,
          '--logpath', logPath,
        ],
        options);
      await waitUntilUsed(dbPort, 500, 15000);
      new Logger().logMsg('-------- Mongod userless instance initialized successfully --------');
      const adminDb = await getUserlessAdminConnection();
      await createAdminUser(adminDb);
      await stopMongodInstance(config.database.development.port);
      spawn(
        process.env.mongod, [
          '--dbpath', dbPath,
          '--port', dbPort,
          '--logpath', logPath,
          '--auth'
        ],
        options);
      await waitUntilUsed(dbPort, 500, 15000);
      new Logger().logMsg('-------- Mongod instance initialized successfully --------');
      await createUserRoles(dbUri);
      new Logger().logMsg('-------- Mongod user roles installed successfully --------');
      const db = await getConnection();
      await createUsers(db);
      new Logger().logMsg('-------- Mongod users installed successfully --------');
    }
  }
}

async function stopMongodInstance(dbPort: number): Promise<void> {
  const portInUse = await check(dbPort, '127.0.0.1');
  if (portInUse) {
    let command;
    if (os.platform() === 'linux') {
      command = 'mongo --port ' + dbPort + ' --eval "db.getSiblingDB(\'admin\').shutdownServer()"';
    } else {
      command = '%mongo% --port ' + dbPort + ' --eval db.getSiblingDB(\'admin\').shutdownServer()';
    }
    await exec(command);
    await waitUntilFree(dbPort, 500, 15000);
    new Logger().logMsg('-------- Mongod instance shut down --------');
  }
}

async function deleteTestDatabaseFiles(dbPath: string, mode: string): Promise<void> {
  if (mode === 'development' && !config.deleteDevelopmentDb) {
    return;
  }
  let deleteCommand;
  if (os.platform() === 'linux') {
    deleteCommand = 'if [ -d ' + `"${dbPath}"` + ' ]; then rm -rf ' + `"${dbPath}"` + '; fi';
  } else {
    deleteCommand = 'if exist ' + `"${dbPath}"` + ' RMDIR /S /Q ';
    deleteCommand += `"${dbPath}"`;
  }
  let createCommand = 'mkdir ';
  createCommand += `"${dbPath}"`;

  await exec(deleteCommand);
  await exec(createCommand);
}

async function initializeMasterDb(dbPort: number): Promise<void> {
  if (!dbPort) {
    await getConnection();
    return;
  }
  // Wait until the mongod instance is up and running
  await waitUntilUsed(dbPort, 500, 20000);
  await getConnection();
}

async function createAdminUser(adminDb: Connection): Promise<void> {
  return adminDb.db.addUser(config.dbAdminUser, config.dbAdminPassword, {
    roles: [ { role: 'userAdminAnyDatabase', db: 'admin' }, 'readWriteAnyDatabase' ]
  });
}

/**
 * Creating roles can only be done through the shell.
 * This function builds a script and passes it to mongo.
 * @param dbUri the DB address and port, as in localhost:1234
 */
async function createUserRoles(dbUri: string): Promise<{}> {
  return new Promise((resolve, reject) => {

    let script = '';
    config.dbRoles.forEach(roleObj => {
      script += `db.createRole(${JSON.stringify(roleObj)}); `;
    });

    const fName = 'mongoScript.js';

    fs.writeFile(fName, script, () => {
      let command = `mongo ${dbUri}/${config.databaseName} `
        + `--authenticationDatabase admin `
        + `-u ${config.dbAdminUser} -p ${config.dbAdminPassword} < ${fName}`;
      exec(command);
      setTimeout( () => {
        fs.unlink(fName, () => {
          resolve();
        })
      }, 1000);
    });
  });

}

async function createUsers(db: Connection): Promise<void> {
  let promises = [];

  config.dbUsers.forEach(user => {
    promises.push(db.db.addUser(user.name, user.password, user.options));
  });

  await Promise.all(promises);
}
