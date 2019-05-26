import { Connection } from 'mongoose';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
import { config } from '../config';
import { Logger } from '../logger/Logger';
import {LibrarianService} from '../../services/librarian/LibrarianService';

let connection: Connection;

/**
 * Creates a database connection
 *
 * @returns {Connection} the created Connection object
 */
export async function getConnection(): Promise<Connection> {
  if (config.modes.integrationTest) {
    return getUserlessIntegrationConnection();
  }
  if (global.currCon) {
    return global.currCon;
  }

  const mode = Object.keys(config.modes).find(iMode => config.modes[ iMode ] === true);
  let databaseUri = config.database[ mode ].uri;
  let connectionString = 'mongodb://Admin:Admin@' + databaseUri + '/'
      + config.databaseName + '?authSource=admin';

  new Logger().logMsg('****** CREATING MONGO CONNECTION to ' + connectionString + '******');
  let dbObject = mongoose.createConnection();
  await dbObject.openUri(connectionString);
  requireFiles(dbObject);
  connection = dbObject;
  return dbObject;
}

export async function getUserlessAdminConnection(): Promise<Connection> {
  if (connection) {
    return connection;
  }
  const mode = Object.keys(config.modes).find(iMode => config.modes[ iMode ] === true);
  let databaseUri = config.database[ mode ].uri;
  let connectionString = 'mongodb://' + databaseUri + '/admin';

  new Logger().logMsg('****** CREATING MONGO CONNECTION to ' + connectionString + '******');
  let dbObject = mongoose.createConnection();
  await dbObject.openUri(connectionString);
  requireFiles(dbObject);
  connection = dbObject;
  return dbObject;
}
export async function getUserlessIntegrationConnection(): Promise<Connection> {
  const mode = Object.keys(config.modes).find(iMode => config.modes[ iMode ] === true);
  let databaseUri = config.database[ mode ].uri;
  let connectionString = 'mongodb://' + databaseUri + '/' + config.databaseName;

  new Logger().logMsg('****** CREATING MONGO CONNECTION to ' + connectionString + '******');
  let dbObject = mongoose.createConnection();
  await dbObject.openUri(connectionString);
  requireFiles(dbObject);
  connection = dbObject;
  return dbObject;
}

export async function authoriseConnection(librarianName: string): Promise<void> {
  if (connection) {
    await connection.close();
  }
  const mode = Object.keys(config.modes).find(iMode => config.modes[ iMode ] === true);
  let databaseUri = config.database[ mode ].uri;
  let connectionString = `mongodb://UNAUTHORISED:12345@${databaseUri}/${config.databaseName}`;

  new Logger().logMsg('****** CREATING MONGO CONNECTION to ' + connectionString + '******');
  let dbObject = mongoose.createConnection();
  await dbObject.openUri(connectionString);
  requireFiles(dbObject);
  const librarianService = new LibrarianService(dbObject);
  const libRole = await librarianService.findOne({name: librarianName});
  await dbObject.close();
  if (libRole) {
    connectionString = `mongodb://${libRole.librarianType}:12345@${databaseUri}/
                      ${config.databaseName}`;
    dbObject = mongoose.createConnection();
    await dbObject.openUri(connectionString);
    global.currCon = dbObject;
  }
}



function requireFiles(db: Connection): void {
  console.log('******! DbConnect Require Files !******');
  global.masterDbInit = false;
  global.masterDbReady = true;
  const logger = new Logger();
  logger.logMsg('******! DbConnect Require Files !******');
  try {
    // Require all models here
    require('../../models/book/BookCopy').default(db);
    require('../../models/book/Book').default(db);
    require('../../models/campus/Campus').default(db);
    require('../../models/book/WishlistItem').default(db);
    require('../../models/user/User').default(db);
    require('../../models/audit/Audit').default(db);

    if (global.masterDbInit) {
      global.masterDbInit = false;
    }
    global.masterDbReady = true;
  } catch (error) {
    logger.logErr(`Requiring and initializing models threw an exception: ${error}`);
  }
}
