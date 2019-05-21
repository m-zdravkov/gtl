import {
  createMemberCard,
} from '../../../integrationTest/CommonIntegrationGenerators';
import { UserType, userTypesEnum } from '../constants/models/user/userConstants';
import { Book, DocBook } from '../../models/book/Book';
import { generateRandomString } from '../../../test/MockGenerators';
import { createBook, createBookCopy } from '../../controllers/book/BookCtrl';
import { BookCopy } from '../../models/book/BookCopy';
import * as moment from 'moment';
import { ObjectId } from '../../models/BaseModel';
import { User } from '../../models/user/User';
import { createUser } from '../../controllers/user/UserCtrl';
import { Logger } from '../logger/Logger';

const numberOfUsersToCreate = 16000;
const numberOfBooksToCreate = 100000;
const numberOfBookCopiesToCreate = 250000;

const percentageOfBookCopiesLoaned = 0.1;
const percentageOfInactiveUsers = 0.2;
const percentageOfProfessors = 0.02;

export async function seedDatabase() {
  const logger = new Logger('Seeding process:');
  logger.logMsg('started');
  const books = await createBooks();
  logger.logMsg('created books');
  const bookCopies = await createBookCopies(books);
  logger.logMsg('created book copies');
  const users = await createUsers();
  logger.logMsg('finished');
}

function createUsers() {
  const usersCreationPromises = [];
  for (let i = 0; i < numberOfUsersToCreate; i++) {
    if (i < numberOfUsersToCreate * percentageOfProfessors) {
      // TODO attach campus for professors
      const request: any = createUserReq(userTypesEnum.PROFESSOR);
      usersCreationPromises.push(createUser(request));
    } else if (i >= numberOfUsersToCreate * percentageOfProfessors) {
      const request: any = createUserReq(userTypesEnum.NORMAL_USER);
      usersCreationPromises.push(createUser(request));
    }
  }
  return Promise.all(usersCreationPromises);
}

function createBooks() {
  const booksPromises = [];
  for (let i = 0; i < numberOfBooksToCreate; i++) {
    const request: any = generateReqBodyForBook();
    booksPromises.push(createBook(request));
  }
  return Promise.all(booksPromises);
}

function createBookCopies(books: DocBook[]) {
  const bookCopiesPromises = [];
  for (let i = 0; i < numberOfBookCopiesToCreate; i++) {
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