export const roles = [
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
];

export const users = [
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
];

export const dbAdminUser = 'Admin';
export const dbAdminPassword = 'Admin';
