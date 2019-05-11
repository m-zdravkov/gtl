require('../app/components/helpers/ArrayExtensions');
import { UserType } from '../app/components/constants/models/user/userConstants';
import { User } from '../app/models/user/User';
import { Types } from "mongoose";
import { BookCopy } from '../app/models/book/BookCopy';
import { Book } from '../app/models/book/Book';
import { Campus } from '../app/models/campus/Campus';
import { MemberCard } from '../app/models/user/MemberCard';
import * as moment from 'moment';
const randString = require('random-string');
export function generateRandomString(length: number): string {
  return randString({length: length});
}

export function generateRandomNumber(length: number): number {
  let min;
  let max;
  for (let i = 0; i < length; i++) {
    if (i === 0) {
      min = 1;
      max = 9;
    } else {
      min = min * 10;
      max = max + 9 * min;
    }
  }
  max = max - min;
  return min + Math.floor((Math.random() * max) + 1);
}
export function createUser(userType: UserType): User {
  const user = new User(
    userType, generateRandomString(10), createCampus(), generateRandomString(10),
    generateRandomString(10) + '@mailinator.com', ['+45 35353535'], createMemberCard());
  user._id = new Types.ObjectId();
  return user;
}

export function createBook(bookCopies?: BookCopy[]): Book {
  const book = new Book(
    [], generateRandomString(10), generateRandomString(10),
    generateRandomString(20), 1950, generateRandomString(10));
  book._id = new Types.ObjectId();
  return book;
}

export function createBookCopy(book: Book): BookCopy {
  const bookCopy = new BookCopy(true, moment(), book._id, moment().add(1, 'month'));
  bookCopy._id = new Types.ObjectId();
  if (book) {
    book.bookCopies.push(bookCopy);
  }
  return bookCopy;
}
export function createCampus(): Campus {
  const campus = new Campus(generateRandomString(10), generateRandomString(10));
  campus._id = new Types.ObjectId();
  return campus;
}

export function createMemberCard(): MemberCard {
  const memberCard = new MemberCard(
    moment().add(1, 'year'),
    moment().add(1, 'year').subtract(1, 'month'),
    false);
  memberCard._id = new Types.ObjectId();
  return memberCard;
}