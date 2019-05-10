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

  beforeEach(async () => {
    const campus = await createCampus();
    const createUserPromise = createUser(userTypesEnum.PROFESSOR, campus._id);
    const book = await createBook();
    const bookCopyOne = await createBookCopy(book);
    const bookCopyTwo = await createBookCopy(book);
    bookCopyOne.expectedReturnDate = moment().subtract(3, 'years');
    bookCopyTwo.expectedReturnDate = moment().subtract(3, 'years');
    const promises = [];
    promises.push(bookCopyOne.save());
    promises.push(bookCopyTwo.save());
    const user = await createUserPromise;
    user.takenBooks.push(bookCopyOne._id);
    user.takenBooks.push(bookCopyTwo._id);
    promises.push(user.save());
    await Promise.all(promises);
    sendEmailStub = stub(Mailer, 'sendMail').resolves();
  });

  afterEach(() => {
    sendEmailStub.restore();
  });

  it('should send the correct number of emails when invoked', async () => {
    response = await chai.request(server)
      .get('/webjobs/notifications/send')
      .send();

    // This timeout is awaited here to give the not-awaited code time to execute
    await new Promise(resolve => setTimeout(resolve, 3000));
    expect(response.status).to.equal(200);
    expect(sendEmailStub.callCount).to.be.equal(2);
  });
});
