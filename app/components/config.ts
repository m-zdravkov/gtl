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
  },
  dbRoles:
  [
    {
      role: 'CHIEF_LIBRARIAN',
      privileges: [],
      roles: ['dbAdmin']
    },
    {
      role: 'LIBRARIAN_ASSISTANT',
      privileges: [
        { resource: { db: 'masterDb', collection: 'librarians' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'users' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'books' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'bookcopies' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'campuses' }, actions: ['find'] },
      ],
      roles: []
    }
  ],
  dbUsers:
  [
    {
      name: 'CHIEF_LIBRARIAN',
      password: '12345',
      options: {
        roles: [ 'CHIEF_LIBRARIAN' ]
      }
    },
    {
      name: 'LIBRARIAN_ASSISTANT',
      password: '12345',
      options: {
        roles: [ 'LIBRARIAN_ASSISTANT' ]
      }
    }
  ],
  dbAdminUser: 'Admin',
  dbAdminPassword: 'Admin'
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

