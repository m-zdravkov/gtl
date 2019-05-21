export const config = {
  modes: {
    integrationTest: false,
    unitTest: false,
    development: false
  },
  clientUrl: 'http://localhost:3000',
  database: {
    integrationTest: {
      'uri': 'localhost:27018',
      'port': 27018,
      'path': '/dbs/testDb',
      'logPath': '/dbs/testDb/mongodb.log'
    },
    unitTest: {
      'uri': 'localhost:27018',
      'port': 27018,
      'path': '/dbs/testDb',
      'logPath': '/dbs/testDb/mongodb.log'
    },
    development: {
      'uri': 'localhost:27017',
      'port': 27017,
      'logPath': '/dbs/localDb/mongodb.log',
      'path': '/dbs/localDb'
    },
    production: false
  },
  databaseName: process.env.dbName || 'masterDb',
  deleteDevelopmentDb: true,
  smtp: {
    auth: {
      user: process.env.SMTPUser,
      pass: process.env.SMTPPass,
      email: process.env.SMTPEmail
    },
    host: process.env.SMTPHost || 'smtp.gmail.com',
    name: process.env.SMTPname,
    port: process.env.SMTPPort || 465,
    sendEmail: process.env.SMTPSendEmail || false
  }
};

export function setDevelopmentEnv(): void {
  setModesToDefault();
  config.modes.development = true;
}

export function setUnitTestEnv(): void {
  setModesToDefault();
  config.modes.unitTest = true;
}

export function setIntegrationTestEnv(): void {
  setModesToDefault();
  config.modes.integrationTest = true;
}

function setModesToDefault(): void {
  Object.keys(config.modes).forEach(key => {
    config.modes[key] = false;
  });
}
