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
      role: 'CHIEF',
      privileges: [],
      roles: ['dbAdmin']
    },
    {
      role: 'ASSISTANT',
      privileges: [
        { resource: { db: 'masterDb', collection: 'librarians' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'users' },
            actions: ['find', 'insert', 'update', 'remove'] },
        { resource: { db: 'masterDb', collection: 'books' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'bookcopies' }, actions: ['find', 'update'] },
        { resource: { db: 'masterDb', collection: 'audits' },
            actions: ['find', 'insert'] },
        { resource: { db: 'masterDb', collection: 'campuses' }, actions: ['find'] }
      ],
      roles: []
    } ,
    {
      role: 'CHECK_OUT',
      privileges: [
        { resource: { db: 'masterDb', collection: 'librarians' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'users' }, actions: ['find', 'update'] },
        { resource: { db: 'masterDb', collection: 'books' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'bookcopies' }, actions: ['find', 'update'] },
        { resource: { db: 'masterDb', collection: 'audits' }, actions: ['insert'] },
        { resource: { db: 'masterDb', collection: 'campuses' }, actions: ['find'] }
      ],
      roles: []
    } ,
    {
      role: 'REFERENCE',
      privileges: [
        { resource: { db: 'masterDb', collection: 'librarians' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'users' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'books' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'bookcopies' }, actions: ['find'] },
        { resource: { db: 'masterDb', collection: 'campuses' }, actions: ['find'] }
      ],
      roles: []
    } ,
    {
      role: 'UNAUTHORISED',
      privileges: [
        { resource: { db: 'masterDb', collection: 'librarians' }, actions: ['find'] }
      ],
      roles: []
    } ,
    {
      role: 'DEPARTMENTAL_ASSOCIATE',
      privileges: [],
      roles: ['readWrite']
    }
  ],
  dbUsers:
  [
    {
      name: 'CHIEF',
      password: '12345',
      options: {
        roles: [ 'CHIEF' ]
      }
    },
    {
      name: 'ASSISTANT',
      password: '12345',
      options: {
        roles: [ 'ASSISTANT' ]
      }
    },
    {
      name: 'REFERENCE',
      password: '12345',
      options: {
        roles: [ 'REFERENCE' ]
      }
    },
    {
      name: 'CHECK_OUT',
      password: '12345',
      options: {
        roles: [ 'CHECK_OUT' ]
      }
    },
    {
      name: 'UNAUTHORISED',
      password: '12345',
      options: {
        roles: [ 'UNAUTHORISED' ]
      }
    },
    {
      name: 'DEPARTMENTAL_ASSOCIATE',
      password: '12345',
      options: {
        roles: [ 'DEPARTMENTAL_ASSOCIATE' ]
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

