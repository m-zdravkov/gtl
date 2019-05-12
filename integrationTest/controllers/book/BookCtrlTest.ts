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
import { userTypesEnum } from '../../../app/components/constants/models/user/userConstants';
import { DocBook } from '../../../app/models/book/Book';
import { DocBookCopy } from '../../../app/models/book/BookCopy';
import { fail } from 'assert';
import { ErrorHandler } from '../../../app/components/ErrorHandler';

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
  let bookNoCopies;
  // let bookUnavailable;
  // let bookRestricted;
  let user;
  // let ineligibleUser;
  let campus;
  let response;
  let copies: DocBookCopy[] = [];
  let copy;

  beforeEach(async() => {
    campus = await createCampus();
    user = await createUser(userTypesEnum.NORMAL_USER, campus.id);
    book = await createBook();
    copy = await createBookCopy(book);
    // bookNoCopies = await createBook();
    // bookUnavailable = await createBook();
    // bookRestricted = await createBook();
    // bookNoCopies = await createBook();

    // for (let i = 0; i < 5; i++) {
    //   copies.push(await createBookCopy(book));
    // }
  });

  it('should return a book by searching its author, title & subject', async() => {
    await chai.request(server)
      .get(`/books`)
      .set('Content-Type', 'application/json')
      .send({
        author: book.author,
        title: book.title,
        subjectArea: book.subjectArea
      })
      .then(res => {
        // console.log(`Book object response: ${JSON.stringify(res)}`);
        expect(res.body[0].ISBN).to.equal(book.ISBN);
      });
  });

  it('should loan an available book copy to an eligible user and return the copy', async() => {

    console.log(`Copy available (from test): ${copy.available}`);
    console.log(`Book (from test): ${book}`);
    console.log(`Copy (from test): ${copy}`);

    await chai.request(server)
      .get(`/books/${book.ISBN}`)
      .set('Content-Type', 'application/json')
      .send()
      .then(res => {
        console.log(`Book (from server): ${JSON.stringify(res)}`);
      });

    response = await chai.request(server)
      .put(`/books/${book.ISBN}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: user.ssn})
      .then(res => {
        expect(res.body.msg).to.equal(JSON.stringify(copy));
      });
  });

  it('should not loan an unexisting ISBN', async() => {
    response = await chai.request(server)
      .put(`/books/${book.ISBN + 'fail'}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: user.ssn})
      .then(res => {
        expect(res).to.have.status(400);
      });
  });

  it('should not loan to an unexisting user', async() => {
    response = await chai.request(server)
      .put(`/books/${book.ISBN}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: user.ssn + 'fail'})
      .then(res => {
        expect(res).to.have.status(400);
      });
  });
  
  it('should not loan to an user with too many loans', async() => {

    fail('not implemented');
  });
  
  it('should not loan a book without copies', async() => {
    
    fail('not implemented');
  });
  
  it('should not loan a restricted book', async() => {
    book.lendingRestrictions = ['rare'];

    response = await chai.request(server)
      .put(`/books/${book.ISBN}/loan`)
      .set('Content-Type', 'application/json')
      .send({ssn: user.ssn})
      .then(res => {
        expect(res).to.have.status(400);
      });
  });
});