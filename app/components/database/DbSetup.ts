import { spawn, exec } from 'child-process-promise';
import { config } from '../config';
import * as path from 'path';
import { check, waitUntilUsed, waitUntilFree } from 'tcp-port-used';
import { Logger } from '../logger/Logger';
import { getConnection } from './DbConnect';

import os = require('os');

export async function dbSetup(): Promise<void> {
  const mode = Object.keys(config.modes).find(iMode => config.modes[ iMode ] === true);
  const logger = new Logger();

  let dbPath = process.cwd();
  let logPath = process.cwd();
  let dbPort = config.database[ mode ].port;

  dbPath += path.normalize(config.database[ mode ].path);
  logPath += path.normalize(config.database[ mode ].logPath);
  try {
    await stopMongodInstance(dbPath, dbPort);
    await deleteTestDatabaseFiles(dbPath, mode);
    await initializeMongodInstance(dbPath, dbPort, logPath);
    await initializeMasterDb(dbPort);
  } catch (err) {
    logger.logErr('-------- Mongod instance did NOT initialize correctly --------');
    return Promise.reject(err);
  }
}

/*  ------------------------ Helper Functions ------------------------*/
async function initializeMongodInstance(
  dbPath: string,
  dbPort: number,
  logPath: string): Promise<void> {
  const portInUse = await check(dbPort, '127.0.0.1');
  if (!portInUse) {
    const options = {
      stdio: 'inherit',
      detached: true
    };
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
  }
}

async function stopMongodInstance(dbPath: string, dbPort: number): Promise<void> {
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
