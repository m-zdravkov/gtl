import { Connection } from 'mongoose';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
import { config } from '../config';
import { Logger } from '../logger/Logger';

let connection: Connection;

/**
 * Creates a database connection
 *
 * @returns {Connection} the created Connection object
 */
export async function getConnection(): Promise<Connection> {
  if (connection) {
    return connection;
  }
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

function requireFiles(db: Connection): void {
  const logger = new Logger();
  logger.logMsg('******! DbConnect Require Files !******');
  try {
    // Require all models here
    require('../../models/campus/Campus').default(db);
    require('./../../models/audit/Audit').default(db);
  } catch (error) {
    logger.logErr(`Requiring and initializing models threw an exception: ${error}`);
  }
}
