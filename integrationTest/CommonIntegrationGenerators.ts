import { UserType } from '../app/components/constants/models/user/userConstants';

require('./../app/components/helpers/ArrayExtensions');
import { CampusService } from '../app/services/campus/CampusService';
import { getConnection } from '../app/components/database/DbConnect';
import { Campus, DocCampus } from '../app/models/campus/Campus';
import { generateRandomString } from '../test/MockGenerators';
import { DocUser, User } from '../app/models/user/User';
import { BookCopy, DocBookCopy } from '../app/models/book/BookCopy';
import { Book, DocBook } from '../app/models/book/Book';
import * as moment from 'moment';
import { MemberCard } from '../app/models/user/MemberCard';
import { ObjectId } from '../app/models/BaseModel';
import { UserService } from '../app/services/user/UserService';
import { BookService } from '../app/services/book/BookService';
import { BookCopyService } from '../app/services/book/BookCopyService';

export async function createCampus(): Promise<DocCampus> {
  const db = await getConnection();
  const campusService = new CampusService(db);
  const campus = new Campus(generateRandomString(10), generateRandomString(10));
  return await campusService.create(campus).save();
}

export async function createUser(userType: UserType, campusId: ObjectId): Promise<DocUser> {
  const db = await getConnection();
  const userService = new UserService(db);
  const user = new User(
    userType, generateRandomString(10), campusId, generateRandomString(10),
    generateRandomString(10) + '@mailinator.com', ['+45 35353535'], createMemberCard());
  return userService.create(user).save();
}

export async function createBook(): Promise<DocBook> {
  const db = await getConnection();
  const bookService = new BookService(db);
  const book = new Book(
    [], generateRandomString(10), generateRandomString(10),
    generateRandomString(20), 1950, generateRandomString(10));
  return bookService.create(book).save();
}

export async function createBookCopy(book: DocBook): Promise<DocBookCopy> {
  const db = await getConnection();
  const bookCopyService = new BookCopyService(db);
  const bookCopy = new BookCopy(true, moment(), 1950, book._id, moment());
  const savedBookCopy = await bookCopyService.create(bookCopy).save();
  book.bookCopies.push(savedBookCopy._id);
  await book.save();
  return savedBookCopy;
}

export function createMemberCard(): MemberCard {
  return new MemberCard(
    moment().add(2, 'years'),
    moment().add(2,'years').subtract(2, 'weeks'),
    false);
}