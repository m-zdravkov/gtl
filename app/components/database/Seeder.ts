import {
  createMemberCard,
} from '../../../integrationTest/CommonIntegrationGenerators';
import { UserType, userTypesEnum } from '../constants/models/user/userConstants';
import { Book, DocBook } from '../../models/book/Book';
import { generateRandomString } from '../../../test/MockGenerators';
import {
  countAvailableCopies,
  createBook,
  createBookCopy,
  loanBook
} from '../../controllers/book/BookCtrl';
import { BookCopy, DocBookCopy } from '../../models/book/BookCopy';
import * as moment from 'moment';
import { ObjectId } from '../../models/BaseModel';
import { DocUser, User } from '../../models/user/User';
import { createUser } from '../../controllers/user/UserCtrl';
import { Logger } from '../logger/Logger';
import { Request } from 'express';

const numberOfUsersToCreate = 16000;
const numberOfBooksToCreate = 100000;
const numberOfBookCopiesToCreate = 250000;

const percentageOfBookCopiesLoaned = 0.1;
const percentageOfInactiveUsers = 0.2;
const percentageOfProfessors = 0.02;

const iterations = 500;

export async function seedDatabase() {
  const logger = new Logger('Seeding process:');
  for (let i = 0; i < iterations; i++) {
    logger.logMsg('started iteration: ' + i);
    const books = await createBooks(Math.round(numberOfBooksToCreate / iterations));
    logger.logMsg('created books');
    const bookCopies = await createBookCopies(books, Math.round(numberOfBookCopiesToCreate / iterations));
    logger.logMsg('created book copies');
    const users = await createUsers(bookCopies, Math.round(numberOfUsersToCreate / iterations));
    logger.logMsg('finished creating users');
    await loanBooksToUsers(Math.round(numberOfBookCopiesToCreate / iterations * percentageOfBookCopiesLoaned), books, users);
    logger.logMsg('finished loaning books');
    logger.logMsg('finished iteration: ' + i);
  }
}

function createUsers(bookCopies: DocBookCopy[], iterations: number): Promise<DocUser[]> {
  const usersCreationPromises = [];
  for (let i = 0; i < iterations; i++) {
    if (i < iterations * percentageOfProfessors) {
      // TODO attach campus for professors
      const request: any = createUserReq(userTypesEnum.PROFESSOR);
      usersCreationPromises.push(createUser(request));
    } else if (i >= iterations * percentageOfProfessors) {
      const request: any = createUserReq(userTypesEnum.NORMAL_USER);
      usersCreationPromises.push(createUser(request));
    }
  }
  return Promise.all(usersCreationPromises);
}

function createBooks(iterations: number): Promise<DocBook[]> {
  const booksPromises = [];
  for (let i = 0; i < iterations; i++) {
    const request: any = generateReqBodyForBook();
    booksPromises.push(createBook(request));
  }
  return Promise.all(booksPromises);
}

function createBookCopies(books: DocBook[], iterations): Promise<DocBookCopy[]> {
  const bookCopiesPromises = [];
  for (let i = 0; i < iterations; i++) {
    const randomBook = books[getRandomInt(books.length)];
    const request: any = generateReqBodyForBookCopy(randomBook._id, randomBook.ISBN);
    bookCopiesPromises.push(createBookCopy(request));
  }
  return Promise.all(bookCopiesPromises);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generateReqBodyForBook(): {body: Object} {
  const book = new Book(
    [], generateRandomString(10), generateRandomString(10),
    generateRandomString(20), 1950, generateRandomString(10));
  return {
    body: book
  };
}

function generateReqBodyForBookCopy(bookId: ObjectId, bookISBN: string):
  { body: Object, params: { isbn: string } } {
  const bookCopy = new BookCopy(true, moment(), bookId, moment());
  return {body: bookCopy, params: {isbn: bookISBN}};
}

function createUserReq(userType: UserType, campusId?: ObjectId): {body: Object} {
  const user = new User(
    userType.toString(), generateRandomString(10), generateRandomString(10),
    generateRandomString(10) + '@mailinator.com', ['+45 35353535'], createMemberCard(), campusId);
  return {body: user}
}

async function loanBooksToUsers(iterations, books: DocBook[], users: DocUser[]): Promise<void> {
  const activeUsers = users.splice(0,Math.round(users.length * (1 - percentageOfInactiveUsers)));
  const loanBookPromises = [];
  const usersMap = new Map<number, number>();

  for (let i = 0; i < iterations; i++) {
    let bookIndex = getRandomInt(books.length);
    let fakeReqCountAvailableCopies = {
      params: { isbn: books[bookIndex].ISBN}
    } as Request;
    const available = await countAvailableCopies(fakeReqCountAvailableCopies);
    let availableCopies = available ? available.count : 0;
    while(availableCopies === 0) {
      bookIndex = getRandomInt(books.length);
      fakeReqCountAvailableCopies.params.isbn = books[bookIndex].ISBN;
      const available = await countAvailableCopies(fakeReqCountAvailableCopies);
      availableCopies = available ? available.count : 0;
    }

    let userIndex = getRandomInt(activeUsers.length);
    while (usersMap.has(userIndex) && usersMap.get(userIndex) === 5) {
      userIndex = getRandomInt(activeUsers.length);
    }
    if (usersMap.has(userIndex)) {
      usersMap.set(userIndex, usersMap.get(userIndex) + 1)
    } else {
      usersMap.set(userIndex, 1)
    }

    const fakeReq = {
      params: { isbn: books[bookIndex].ISBN},
      body: { ssn: activeUsers[userIndex].ssn }
    } as Request;
    loanBookPromises.push(loanBook(fakeReq));

  }
  await loanBookPromises;
}
