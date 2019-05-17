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
import * as notificationCtrl from './../../app/controllers/webjobs/NotificationCtrl';
import * as moment from 'moment';

const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

before(async () => {
  while (!global.masterDbReady) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
});

describe('bookNotifications webjob', () => {
  let sendEmailStub;
  let stubMemberCardNotifications;
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
    stubMemberCardNotifications = stub (notificationCtrl,
                                        'sendMembershipCardsNotifications').resolves();
  });

  afterEach(() => {
    sendEmailStub.restore();
    stubMemberCardNotifications.restore();
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

  it('should send email to campus email for a professor', async () => {
    const promises = [];
    user.userType = userTypesEnum.PROFESSOR;
    bookCopyOne.expectedReturnDate = moment().subtract(2, 'weeks');
    promises.push(bookCopyOne.save());
    user.takenBooks.push(bookCopyOne._id);
    user.takenBooks.push(bookCopyTwo._id);
    promises.push(user.save());
    await Promise.all(promises);

    response = await chai.request(server)
      .get('/webjobs/notifications/send')
      .send();
    expect(response.status).to.equal(200);
    expect(sendEmailStub.getCall(0).args[0]).to.be.equal(campus.address);
  });

  it('should send email to users email for a normal user', async () => {
    const promises = [];
    user.userType = userTypesEnum.NORMAL_USER;
    bookCopyOne.expectedReturnDate = moment().subtract(2, 'weeks');
    promises.push(bookCopyOne.save());
    user.takenBooks.push(bookCopyOne._id);
    user.takenBooks.push(bookCopyTwo._id);
    promises.push(user.save());
    await Promise.all(promises);

    response = await chai.request(server)
      .get('/webjobs/notifications/send')
      .send();
    expect(response.status).to.equal(200);
    expect(sendEmailStub.getCall(0).args[0]).to.be.equal(user.mailingAddress);
  });
});

describe('memberCardNotifications webjob', () => {
  let sendEmailStub;
  let stubBookNotifications;
  let response;
  let campus;
  let user;

  beforeEach(async () => {
    campus = await createCampus();
    user = await createUser(userTypesEnum.PROFESSOR, campus._id);
    sendEmailStub = stub(Mailer, 'sendMail').resolves();
    stubBookNotifications = stub (notificationCtrl, 'sendBookNotifications').resolves();
  });

  afterEach(() => {
    sendEmailStub.restore();
    stubBookNotifications.restore();
  });

  it('should send membership notification', async () => {
    user.memberCard.notificationSendoutDate = moment().subtract(1, 'day');
    await user.save();

    response = await chai.request(server)
      .get('/webjobs/notifications/send')
      .send();
    expect(response.status).to.equal(200);
    expect(sendEmailStub.callCount).to.be.equal(1);
  });

  it('should not send membership notification if expiration date is not yet come', async () => {
    user.memberCard.notificationSendoutDate = moment().add(1, 'day');
    await user.save();

    response = await chai.request(server)
      .get('/webjobs/notifications/send')
      .send();
    expect(response.status).to.equal(200);
    expect(sendEmailStub.callCount).to.be.equal(0);
  });
});
