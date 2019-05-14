import { BookCopyService } from '../../../app/services/book/BookCopyService';

require('../../SetupTestConfig');

import {
  createBook,
  createBookCopy,
  createCampus,
  createUser
} from '../../CommonIntegrationGenerators';
import {server} from '../../../server';
import * as chai from 'chai';
import {stub} from 'sinon';
import * as moment from 'moment';
import { createTracing } from 'trace_events';
import {
  userTypesEnum,
  maxLoans
} from '../../../app/components/constants/models/user/userConstants';
import { DocBook } from '../../../app/models/book/Book';
import { DocBookCopy, BookCopy } from '../../../app/models/book/BookCopy';
import { fail } from 'assert';
import { ErrorHandler } from '../../../app/components/ErrorHandler';
import { DocUser } from '../../../app/models/user/User';
import { create } from 'domain';
import { DocCampus } from '../../../app/models/campus/Campus';
import { getConnection } from '../../../app/components/database/DbConnect';
import { UserService } from '../../../app/services/user/UserService';
import { Types } from 'mongoose';
import { generateRandomString } from '../../../test/MockGenerators';

const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

before(async () => {
  while (!global.masterDbReady) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
});

describe('The book controller', () => {
  let book: DocBook;
  let user: DocUser;
  let campus: DocCampus;
  let copy: DocBookCopy;

  beforeEach(async() => {
    campus = await createCampus();
    user = await createUser(userTypesEnum.NORMAL_USER, campus._id);
    book = await createBook();
    copy = await createBookCopy(book);
  });

  xit('should find a single book by searching its author, title & subject', async() => {
    // Create two 'wrong' books
    const bookWrong1: DocBook = await createBook();
    const bookWrong2: DocBook = await createBook();
    bookWrong1.author = book.author + 'wrong1';
    bookWrong2.author = book.author + 'wrong2';
    bookWrong1.title = book.title + 'wrong1';
    bookWrong2.title = book.title + 'wrong2';
    bookWrong1.subjectArea = book.subjectArea + 'wrong1';
    bookWrong2.subjectArea = book.subjectArea + 'wrong2';
    await bookWrong1.save();
    await bookWrong2.save();

    let res = await chai.request(server)
      .get(`/books/`)
      .query({
        bookTitle: book.title,
        bookAuthor: book.author,
        bookSubject: book.subjectArea
      })
      .set('Content-Type', 'application/json')
      .send();

    const books: DocBook[] = res.body;
    expect(books.length).to.equal(1);
    expect(books[0].ISBN).to.equal(book.ISBN);
  });

  it('should loan an available book copy to an eligible user', async() => {
    let res = await chai.request(server)
      .put(`/books/${book.ISBN}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: user.ssn});

    const savedUser = JSON.parse(JSON.stringify(
      await new UserService(await getConnection()).findOneLean({ssn: user.ssn})));
    const foundCopy = savedUser.takenBooks
      .find((takenBookCopyId: any) => takenBookCopyId === copy._id.toHexString());

    expect(res.status).to.equal(200);
    expect(!!foundCopy).to.be.equal(true);
  });

  it('should not loan an unexisting ISBN', async() => {
    let res = await chai.request(server)
      .put(`/books/${book.ISBN + 'fail'}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: user.ssn});

    expect(res).to.have.status(400);
    expect(res.body.msg).to.equal('Book ISBN not found');
  });

  it('should not loan to an unexisting user', async() => {
    let res = await chai.request(server)
      .put(`/books/${book.ISBN}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: user.ssn + 'fail'});

    expect(res).to.have.status(400);
    expect(res.body.msg).to.equal('User SSN not found');
  });

  it('should not loan to an user with too many loans', async() => {
    const userIneligible: DocUser = await createUser(userTypesEnum.NORMAL_USER, campus._id);
    let copies: DocBookCopy[] = [];

    // Make sure we have maxLoans + 1 copies available
    for (let i = 0; i < maxLoans; i++) {
      copies.push(await createBookCopy(book));
    }

    userIneligible.takenBooks = copies;
    await userIneligible.save();

    let res = await chai.request(server)
      .put(`/books/${book.ISBN}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: userIneligible.ssn});

    expect(res).to.have.status(400);
    expect(res.body.msg).to.equal(`User can not loan more than ${maxLoans} books`);
  });

  it('should not loan a book without copies', async() => {
    const bookNoCopies = await createBook();
    let res = await chai.request(server)
      .put(`/books/${bookNoCopies.ISBN}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: user.ssn});

    expect(res).to.have.status(400);
    expect(res.body.msg).to.equal('No copies are available');
  });

  it('should not loan a restricted book', async() => {
    book.lendingRestrictions = ['rare'];
    await book.save();

    let res = await chai.request(server)
      .put(`/books/${book.ISBN}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: user.ssn});

    expect(res).to.have.status(400);
    expect(res.body.msg).to.equal('Book is restricted');
  });
});

describe('The book controller createBookCopy', () => {
  let book: DocBook;
  let copy: DocBookCopy;

  beforeEach(async() => {
    book = await createBook();
    copy = await createBookCopy(book);
  });

  it('should fail creating a copy for an unexisting book', async() => {
    let res = await chai.request(server)
      .post(`/books/${book.ISBN + 'fail'}/copies`)
      .send(copy);

    expect(res).to.have.status(400);
  });

  it('should register a new book copy reference in the Book document', async() => {
    let res = await chai.request(server)
      .post(`/books/${book.ISBN}/copies`)
      .send(copy);

    expect(res).to.have.status(200);
    expect(book.bookCopies).to.contain(copy._id.toHexString());
  });
});

describe('The book controller setBookCopyStatus', () => {
  let bookCopy;
  let book;
  let status = 'some status';

  beforeEach(async() => {
    book = await createBook();
    bookCopy = await createBookCopy(book);
  });

  it('should update status of the book copy', async() => {
    let res = await chai.request(server)
      .post(`/books/asd/copies/${bookCopy._id}`)
      .send({status: status});

    const savedBookCopy = await new BookCopyService(await getConnection())
      .findByIdNotNull(bookCopy._id);
    expect(res).to.have.status(200);
    expect(savedBookCopy.status).to.be.equal(status);
  });

  it('should fail updating the status of a non existent book copy', async() => {
    let res = await chai.request(server)
      .post(`/books/asd/copies/${new Types.ObjectId()}`)
      .send({status: status});
    expect(res).to.have.status(400);
    expect(res.body.msg).to.be.equal('Book copy was not found');
  });

  it('should fail for exceeding maximum characters for status', async() => {
    status = generateRandomString(20001);
    let res = await chai.request(server)
      .post(`/books/asd/copies/${bookCopy._id}`)
      .send({status: status});
    expect(res).to.have.status(400);
  });

});