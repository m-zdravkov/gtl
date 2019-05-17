require('../app/components/helpers/ArrayExtensions');
import {Campus} from '../app/models/campus/Campus';
import {User} from '../app/models/user/User';
import {BookCopy} from '../app/models/book/BookCopy';
import {Book} from '../app/models/book/Book';
import * as moment from 'moment';
import {MemberCard} from '../app/models/user/MemberCard';
import {ObjectId} from '../app/models/BaseModel';
import {UserType} from '../app/components/constants/models/user/userConstants';
import {Types} from 'mongoose';
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

export function createCampus(): Campus {
    const campus = new Campus(
        generateRandomString(10) + '@mailinator.com', generateRandomString(10));
    campus._id = new Types.ObjectId();
    return campus;
}

export function createUser(userType: UserType, campusId: ObjectId): User {
    let user = new User(
        userType, generateRandomString(10), campusId, generateRandomString(10),
        generateRandomString(10) + '@mailinator.com', ['+45 35353535'], createMemberCard());
    user._id = new Types.ObjectId();
    user.takenBooks = [];
    user = {userType: user.userType, takenBooks: user.takenBooks, ssn: user.ssn,
        campus: user.campus, _id: user._id, homeAddress: user.homeAddress,
        phoneNumbers: user.phoneNumbers, memberCard: user.memberCard,
        mailingAddress: user.mailingAddress, save(): User {
            return user;
        }} as User;
    return user;
}

export function createBook(): Book {
    let book = new Book(
        [], generateRandomString(10), generateRandomString(10),
        generateRandomString(20), 1950, generateRandomString(10));
    book._id = new Types.ObjectId();
    book.bookCopies = [];
    book = {_id: book._id, bookCopies: book.bookCopies, ISBN: book.ISBN, author: book.author,
        title: book.title, publishYear: book.publishYear, subjectArea: book.subjectArea,
        lendingRestrictions: book.lendingRestrictions, description: book.description,
        save(): Book {
            return book;
        }} as Book;
    return book;
}

export function createBookCopy(book: Book): BookCopy {
    let copy = new BookCopy(true, moment(), book._id, moment());
    copy._id = new Types.ObjectId();
    copy = {_id: copy._id, available: copy.available, takenDate: copy.takenDate,
        bookId: copy.bookId, expectedReturnDate: copy.expectedReturnDate,
        reminderSent: copy.reminderSent, status: copy.status, save(): BookCopy {
            return copy;
        }} as BookCopy;
    return copy;
}

export function createMemberCard(): MemberCard {
    const memberCard = new MemberCard(
        moment().add(2, 'years'),
        moment().add(2, 'years').subtract(2, 'weeks'),
        false);
    memberCard._id = new Types.ObjectId();
    return memberCard;
}

