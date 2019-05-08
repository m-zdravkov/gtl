import { initializeResources } from './app/communication/resources/Resources';
import {Logger} from './app/components/logger/Logger';
import { Request, Response, NextFunction} from 'express';
import {
  config,
  setIntegrationTestEnv,
  setUnitTestEnv,
  setDevelopmentEnv } from './app/components/config';
import { dbSetup} from './app/components/database/DbSetup';
require('./app/components/helpers/ArrayExtensions');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const port = process.env.PORT || 1337;
const baseHost = process.env.WEBSITE_HOSTNAME || 'localhost';
const mongoSanitize = require('express-mongo-sanitize');

// A global.masterDbReady = false;
// A global.masterDbInit = true;

// Set config variables based on arguments passed to node when starting the application
if (process.argv) {
  const args = process.argv.slice(2);
  args.forEach((arg) => {
    if (arg === '--local') {
      new Logger().logMsg('-------- BPM API server will use local database --------');
      setDevelopmentEnv();
    } else if (arg === '--unit-test') {
      new Logger().logMsg('-------- BPM API server will run in test mode --------');
      setUnitTestEnv();
    } else if (arg === '--integration-test') {
      new Logger().logMsg('-------- BPM API server will run in test mode --------');
      setIntegrationTestEnv();
    }
  });
}

if (process.env.prodEnv === '0') {
  setDevelopmentEnv();
}

process.on('unhandledRejection', error => {
  new Logger('unhandledRejection').logErr(error);
});

const app = express();
export const server = http.createServer(app);

app.use(compression());

// Set application to parse body as JSON
// Requests should have Content-Type = 'application/json'
app.use(bodyParser.json({
  limit: 10000000
}));

// Need for Content-Type = 'application/x-www-form-urlencoded'
app.use(bodyParser.urlencoded({ extended: false }));

// Used to allow cross domain requests from clients
app.use(function (req: Request, res: Response, next: NextFunction): void {
  res.header('Access-Control-Allow-Origin', config.clientUrl);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header['Access-Control-Allow-Headers'] =
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept';
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.all('*', mongoSanitize());

dbSetup().then(() => {
  initializeResources(app, express.Router());
}).then(() => {
  new Logger().logMsg('-------- Initialization completed --------');
}).catch((err) => {
  new Logger('-------- Error occurred during initialization --------').logErr(err);
});

// Setup HTTP server to listen on port
server.listen(port, baseHost, () => {
  new Logger().logMsg('-------- BPM API server application started --------');
});
