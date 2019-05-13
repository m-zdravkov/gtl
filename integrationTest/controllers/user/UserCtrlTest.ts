import { DocBook } from '../../../app/models/book/Book';
import {
  createBook,
  createBookCopy,
  createCampus,
  createUser
} from '../../CommonIntegrationGenerators';
import { userTypesEnum } from '../../../app/components/constants/models/user/userConstants';
import * as moment from 'moment';
import * as chai from "chai";
import { server } from '../../../server';
import { BookCopyService } from '../../../app/services/book/BookCopyService';
import { getConnection } from '../../../app/components/database/DbConnect';
import { UserService } from '../../../app/services/user/UserService';
import { Types } from 'mongoose';

const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

describe('The User controller returnBook', () => {
  let book: DocBook;
  let user;
  let campus;
  let response;
  let copy;

  beforeEach(async () => {
    campus = await createCampus();
    user = await createUser(userTypesEnum.NORMAL_USER, campus.id);
    book = await createBook();
    copy = await createBookCopy(book);
    user.takenBooks.push(copy._id);
    copy.takenDate = moment();
    copy.available = false;
    copy.expectedReturnDate = moment().add(21, 'days');

    await Promise.all([user.save(), copy.save()]);
  });

  it('should change the availability status to true', async () => {
    response = await chai.request(server)
      .put(`/users/${user.ssn}/bookcopies/${copy._id}/return`)
      .send();

    const savedBookCopy = await new BookCopyService(await getConnection()).findByIdLean(copy._id);
    expect(response.status).to.equal(200);
    expect(savedBookCopy.available).to.be.equal(true);
  });

  it('should remove the book copy from the users taken books', async () => {
    response = await chai.request(server)
      .put(`/users/${user.ssn}/bookcopies/${copy._id}/return`)
      .send();

    const savedUser = JSON.parse(JSON.stringify(await new UserService(await getConnection()).findOneLean({ssn: user.ssn})));
    const foundCopy = savedUser.takenBooks.find(takenBookCopyId => takenBookCopyId === copy._id.toHexString());
    expect(response.status).to.equal(200);
    expect(!!foundCopy).to.be.equal(false);
  });

  it('should fail if the book copy is not existent', async () => {
    response = await chai.request(server)
      .put(`/users/${user.ssn}/bookcopies/${Types.ObjectId()}/return`)
      .send();

    expect(response.status).to.equal(400);
    expect(response.body.msg).to.be.equal('The book copy has already been returned');
  });

  it('should fail if the user is not existent', async () => {
    response = await chai.request(server)
      .put(`/users/${Types.ObjectId()}/bookcopies/${copy._id}/return`)
      .send();
    expect(response.status).to.equal(400);
    expect(response.body.msg).to.be.equal('User not found');
  });

  it('should remove the expected return date property from the book copy', async () => {
    response = await chai.request(server)
      .put(`/users/${user.ssn}/bookcopies/${copy._id}/return`)
      .send();

    const savedBookCopy = await new BookCopyService(await getConnection()).findByIdLean(copy._id);
    expect(response.status).to.equal(200);
    expect(savedBookCopy.expectedReturnDate).to.not.exist;
  });

  it('should remove the reminder sent return date property from the book copy', async () => {
    copy.reminderSent = true;
    await copy.save();
    response = await chai.request(server)
      .put(`/users/${user.ssn}/bookcopies/${copy._id}/return`)
      .send();

    const savedBookCopy = await new BookCopyService(await getConnection()).findByIdLean(copy._id);
    expect(response.status).to.equal(200);
    expect(savedBookCopy.reminderSent).to.not.exist;
  });

  it('should remove the taken date property from the book copy', async () => {
    response = await chai.request(server)
      .put(`/users/${user.ssn}/bookcopies/${copy._id}/return`)
      .send();

    const savedBookCopy = await new BookCopyService(await getConnection()).findByIdLean(copy._id);
    expect(response.status).to.equal(200);
    expect(savedBookCopy.takenDate).to.not.exist;
  });
});