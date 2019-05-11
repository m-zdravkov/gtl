import { userTypesEnum } from '../../app/components/constants/models/user/userConstants';

require('./../SetupTestConfig');
import {
  createBook,
  createBookCopy,
  createCampus,
  createUser
} from '../CommonIntegrationGenerators';
import {server} from '../../server';
import * as chai from 'chai';
import {stub} from 'sinon';
import * as Mailer from './../../app/components/helpers/Mail';
import * as moment from 'moment';

const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

before(async () => {
  while (!global.masterDbReady) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
});

describe('The token webjob', () => {
  let sendEmailStub;
  let response;
  let campus;
  let bookCopyOne;
  let bookCopyTwo;
  let book;
  let user;

  beforeEach(async () => {
    campus = await createCampus();
    const createUserPromise = createUser(userTypesEnum.PROFESSOR, campus._id);
    book = await createBook();
    bookCopyOne = await createBookCopy(book);
    bookCopyTwo = await createBookCopy(book);
    user = await createUserPromise;
    sendEmailStub = stub(Mailer, 'sendMail').resolves();
  });

  afterEach(() => {
    sendEmailStub.restore();
  });

  it('should send 2 emails for overdue books to professor', async () => {
    const promises = [];
    bookCopyOne.expectedReturnDate = moment().subtract(2, 'weeks');
    bookCopyTwo.expectedReturnDate = moment().subtract(2, 'weeks');
    promises.push(bookCopyOne.save());
    promises.push(bookCopyTwo.save());
    user.takenBooks.push(bookCopyOne._id);
    user.takenBooks.push(bookCopyTwo._id);
    promises.push(user.save());
    await Promise.all(promises);

    response = await chai.request(server)
      .get('/webjobs/notifications/send')
      .send();
    expect(response.status).to.equal(200);
    expect(sendEmailStub.callCount).to.be.equal(2);
  });

  it('should send no emails for overdue books to professor', async () => {
    const promises = [];
    bookCopyOne.expectedReturnDate = moment().subtract(1, 'week');
    bookCopyTwo.expectedReturnDate = moment().subtract(1, 'week');
    promises.push(bookCopyOne.save());
    promises.push(bookCopyTwo.save());
    user.takenBooks.push(bookCopyOne._id);
    user.takenBooks.push(bookCopyTwo._id);
    promises.push(user.save());
    await Promise.all(promises);

    response = await chai.request(server)
      .get('/webjobs/notifications/send')
      .send();
    expect(response.status).to.equal(200);
    expect(sendEmailStub.callCount).to.be.equal(0);
  });

  it('should send 2 emails for overdue books to normal user', async () => {
    const promises = [];
    user.userType = userTypesEnum.NORMAL_USER;
    bookCopyOne.expectedReturnDate = moment().subtract(1, 'week');
    bookCopyTwo.expectedReturnDate = moment().subtract(1, 'week');
    promises.push(bookCopyOne.save());
    promises.push(bookCopyTwo.save());
    user.takenBooks.push(bookCopyOne._id);
    user.takenBooks.push(bookCopyTwo._id);
    promises.push(user.save());
    await Promise.all(promises);

    response = await chai.request(server)
      .get('/webjobs/notifications/send')
      .send();
    expect(response.status).to.equal(200);
    expect(sendEmailStub.callCount).to.be.equal(2);
  });

  it('should send no emails for overdue books to normal user', async () => {
    const promises = [];
    user.userType = userTypesEnum.NORMAL_USER;
    bookCopyOne.expectedReturnDate = moment().subtract(6, 'days');
    bookCopyTwo.expectedReturnDate = moment().subtract(6, 'days');
    promises.push(bookCopyOne.save());
    promises.push(bookCopyTwo.save());
    user.takenBooks.push(bookCopyOne._id);
    user.takenBooks.push(bookCopyTwo._id);
    promises.push(user.save());
    await Promise.all(promises);

    response = await chai.request(server)
      .get('/webjobs/notifications/send')
      .send();
    expect(response.status).to.equal(200);
    expect(sendEmailStub.callCount).to.be.equal(0);
  });
});
