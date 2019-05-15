import { BookService } from '../../app/services/book/BookService';

require('./../SetupTestConfig');
import {
  createBook,
  createBookCopy
} from '../CommonIntegrationGenerators';
import * as chai from 'chai';
import { getConnection } from '../../app/components/database/DbConnect';
import { Types } from 'mongoose';
import { isObjOrRefEquals } from '../../app/models/BaseModel';
import { generateRandomString } from '../../test/MockGenerators';

const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

before(async () => {
  while (!global.masterDbReady) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
});

describe('Base service', () => {
  it('findById should find the correct document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findById(book._id);
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findById should return an instance of document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findById(book._id);
    expect(foundBook.hasOwnProperty('_doc')).to.be.equal(true);
  });

  it('findById should return null if id is not existent', async () => {
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findById(new Types.ObjectId());
    expect(foundBook).to.be.equal(null);
  });

  it('findById projection shall return the element in the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findById(book._id, 'title');
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findById projection shall not return element outside the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findById(book._id, 'title');
    expect(foundBook.publishYear).to.be.equal(undefined);
  });

  it('findById population shall return the ids populated', async () => {
    const book = await createBook();
    const bookCopy = await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook: any = await bookService.findById(book._id, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    expect(isObjOrRefEquals(foundBook.bookCopies[0]._id, bookCopy._id)).to.be.equal(true);
  });

  it('findById population shall return an instance of document', async () => {
    const book = await createBook();
    await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook: any = await bookService.findById(book._id, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    expect(foundBook.bookCopies[0].hasOwnProperty('_doc')).to.be.equal(true);
  });

  it('findByIdLean should find the correct document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findByIdLean(book._id);
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findByIdLean should return an instance of document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findByIdLean(book._id);
    expect(foundBook.hasOwnProperty('_doc')).to.be.equal(false);
  });

  it('findByIdLean should return null if id is not existent', async () => {
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findByIdLean(new Types.ObjectId());
    expect(foundBook).to.be.equal(null);
  });

  it('findByIdLean projection shall return the element in the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findByIdLean(book._id, 'title');
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findByIdLean projection shall not return element outside the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findByIdLean(book._id, 'title');
    expect(foundBook.publishYear).to.be.equal(undefined);
  });

  it('findByIdLean population shall return the ids populated', async () => {
    const book = await createBook();
    const bookCopy = await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook: any = await bookService.findByIdLean(book._id, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    expect(isObjOrRefEquals(foundBook.bookCopies[0]._id, bookCopy._id)).to.be.equal(true);
  });

  it('findByIdLean population shall return not an instance of document', async () => {
    const book = await createBook();
    await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook: any = await bookService.findByIdLean(book._id, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    expect(foundBook.bookCopies[0].hasOwnProperty('_doc')).to.be.equal(false);
  });

  it('find should find the correct document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.find(book._id);
    const foundBook = foundBooks[0];
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('find should return an array with single element', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.find({ISBN: book.ISBN});
    expect(foundBooks.length).to.be.equal(1);
  });

  it('find should return an array with instance of document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.find({ISBN: book.ISBN});
    const foundBook = foundBooks[0];
    expect(foundBook.hasOwnProperty('_doc')).to.be.equal(true);
  });

  it('find should return empty array for unmatched filter', async () => {
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.find({ISBN: generateRandomString(10)});
    expect(foundBooks.length).to.be.equal(0);
  });

  it('find projection shall return the element in the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.find({ISBN: book.ISBN}, 'title');
    const foundBook = foundBooks[0];
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('find projection shall not return element outside the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.find({ISBN: book.ISBN}, 'title');
    const foundBook = foundBooks[0];
    expect(foundBook.publishYear).to.be.equal(undefined);
  });

  it('find population shall return the ids populated', async () => {
    const book = await createBook();
    const bookCopy = await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks: any = await bookService.find({ISBN: book.ISBN}, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    const foundBook = foundBooks[0];
    expect(isObjOrRefEquals(foundBook.bookCopies[0]._id, bookCopy._id)).to.be.equal(true);
  });

  it('find population shall return not an instance of document', async () => {
    const book = await createBook();
    await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks: any = await bookService.find({ISBN: book.ISBN}, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    const foundBook = foundBooks[0];
    expect(foundBook.bookCopies[0].hasOwnProperty('_doc')).to.be.equal(true);
  });

  it('findLean should find the correct document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.findLean(book._id);
    const foundBook = foundBooks[0];
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findLean should return an array with single element', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.findLean({ISBN: book.ISBN});
    expect(foundBooks.length).to.be.equal(1);
  });

  it('findLean should return an array with instance of document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.findLean({ISBN: book.ISBN});
    const foundBook = foundBooks[0];
    expect(foundBook.hasOwnProperty('_doc')).to.be.equal(false);
  });

  it('findLean should return empty array for unmatched filter', async () => {
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.findLean({ISBN: generateRandomString(10)});
    expect(foundBooks.length).to.be.equal(0);
  });

  it('findLean projection shall return the element in the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.findLean({ISBN: book.ISBN}, 'title');
    const foundBook = foundBooks[0];
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findLean projection shall not return element outside the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks = await bookService.findLean({ISBN: book.ISBN}, 'title');
    const foundBook = foundBooks[0];
    expect(foundBook.publishYear).to.be.equal(undefined);
  });

  it('findLean population shall return the ids populated', async () => {
    const book = await createBook();
    const bookCopy = await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks: any = await bookService.findLean({ISBN: book.ISBN}, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    const foundBook = foundBooks[0];
    expect(isObjOrRefEquals(foundBook.bookCopies[0]._id, bookCopy._id)).to.be.equal(true);
  });

  it('findLean population shall return not an instance of document', async () => {
    const book = await createBook();
    await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBooks: any = await bookService.findLean({ISBN: book.ISBN}, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    const foundBook = foundBooks[0];
    expect(foundBook.bookCopies[0].hasOwnProperty('_doc')).to.be.equal(false);
  });

  it('findOne should find the correct document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOne({ISBN: book.ISBN});
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findOne should return an instance of document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOne({ISBN: book.ISBN});
    expect(foundBook.hasOwnProperty('_doc')).to.be.equal(true);
  });

  it('findOne should return null if id is not existent', async () => {
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOne(new Types.ObjectId());
    expect(foundBook).to.be.equal(null);
  });

  it('findOne projection shall return the element in the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOne({ISBN: book.ISBN}, 'title');
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findOne projection shall not return element outside the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOne({ISBN: book.ISBN}, 'title');
    expect(foundBook.publishYear).to.be.equal(undefined);
  });

  it('findOne population shall return the ids populated', async () => {
    const book = await createBook();
    const bookCopy = await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook: any = await bookService.findOne({ISBN: book.ISBN}, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    expect(isObjOrRefEquals(foundBook.bookCopies[0]._id, bookCopy._id)).to.be.equal(true);
  });

  it('findOne population shall return an instance of document', async () => {
    const book = await createBook();
    await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook: any = await bookService.findOne({ISBN: book.ISBN}, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    expect(foundBook.bookCopies[0].hasOwnProperty('_doc')).to.be.equal(true);
  });

  it('findOneLean should find the correct document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOneLean({ISBN: book.ISBN});
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findOneLean should return an instance of document', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOneLean({ISBN: book.ISBN});
    expect(foundBook.hasOwnProperty('_doc')).to.be.equal(false);
  });

  it('findOneLean should return null if id is not existent', async () => {
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOneLean(new Types.ObjectId());
    expect(foundBook).to.be.equal(null);
  });

  it('findOneLean projection shall return the element in the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOneLean({ISBN: book.ISBN}, 'title');
    expect(foundBook.title).to.be.equal(book.title);
  });

  it('findOneLean projection shall not return element outside the projection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook = await bookService.findOneLean({ISBN: book.ISBN}, 'title');
    expect(foundBook.publishYear).to.be.equal(undefined);
  });

  it('findOneLean population shall return the ids populated', async () => {
    const book = await createBook();
    const bookCopy = await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook: any = await bookService.findOneLean({ISBN: book.ISBN}, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    expect(isObjOrRefEquals(foundBook.bookCopies[0]._id, bookCopy._id)).to.be.equal(true);
  });

  it('findOneLean population shall return not an instance of document', async () => {
    const book = await createBook();
    await createBookCopy(book);
    const db = await getConnection();
    const bookService = new BookService(db);

    const foundBook: any = await bookService.findOneLean({ISBN: book.ISBN}, undefined, {
      path: 'bookCopies',
      model: 'BookCopy'
    });
    expect(foundBook.bookCopies[0].hasOwnProperty('_doc')).to.be.equal(false);
  });

  it('remove should delete a document from collection', async () => {
    const book = await createBook();
    const db = await getConnection();
    const bookService = new BookService(db);
    await bookService.remove({ISBN: book.ISBN});
    const foundBook = await bookService.findOneLean({ISBN: book.ISBN});
    expect(foundBook).to.be.equal(null);
  });

  it('updateMany should update multiple document in collection', async () => {
    const dummyTitle = 'dummyTitle';
    const book = await createBook();
    const bookTwo = await createBook();
    const bookThree = await createBook();

    const db = await getConnection();
    const bookService = new BookService(db);
    await bookService.updateMany(
      {_id: {$in: [book._id, bookTwo._id, bookThree._id]}}, {$set: {title: dummyTitle}});
    const foundBooks = await bookService.find({title: dummyTitle});
    expect(foundBooks.length).to.be.equal(3);
  });

  it('updateMany should not update unspecified document', async () => {
    const dummyTitle = 'dummyTitle';
    const book = await createBook();
    const bookTwo = await createBook();
    const bookThree = await createBook();
    const bookFour = await createBook();

    const db = await getConnection();
    const bookService = new BookService(db);
    await bookService.updateMany(
      {_id: {$in: [book._id, bookTwo._id, bookThree._id]}}, {$set: {title: dummyTitle}});
    const foundBook = await bookService.findById(bookFour._id);
    expect(foundBook.title).to.not.be.equal(dummyTitle);
  });
});
