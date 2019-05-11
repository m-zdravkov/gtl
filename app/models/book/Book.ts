import { BaseModel, ObjectIdOrRef } from '../BaseModel';
import {Connection, Document, Schema} from 'mongoose';
import { BookCopy } from './BookCopy';
import moment = require('moment');

export class Book extends BaseModel {

    bookCopies: ObjectIdOrRef<BookCopy>[];
    ISBN: string;
    author: string;
    title: string;
    publishYear: number;
    subjectArea: string;
    description?: string;

    constructor(bookCopies: ObjectIdOrRef<BookCopy>[],
                ISBN: string,
                author: string,
                title: string,
                publishYear: number,
                subjectArea: string,
                description?: string ) {
        super();
        this.bookCopies = bookCopies;
        this.ISBN = ISBN;
        this.author = author;
        this.title = title;
        this.publishYear = publishYear;
        this.subjectArea = subjectArea;
        this.description = description;
    }
}

export interface LeanBook extends Book {
}

export interface DocBook extends Book, Document {
}

const BookSchema = new Schema({
    bookCopies: {type: [Schema.Types.ObjectId], ref: 'BookCopy', required: false},
    ISBN: {type: String, required: true, unique: true},
    author: {type: String, required: true},
    title: {type: String, required: true},
    publishYear: {
      type: Number,
      required: true,
      validate: { validator: validatePublishYear, msg: 'The book is not yet published' }
    },
    subjectArea: {type: String, required: true},
    description: {type: String, required: false}
});

function validatePublishYear(value: number): boolean {
  return parseInt(moment().format('YYYY'), 10) >= value;
}

export default function (db: Connection): void {
    db.model<DocBook>('Book', BookSchema);
}

