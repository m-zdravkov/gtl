import {BaseModel} from '../BaseModel';
import {Connection, Document, Schema} from 'mongoose';
import {Moment} from 'moment';

export class Book extends BaseModel {

    bookCopies: number[];
    ISBN: string;
    author: string;
    title: string;
    publishYear: Moment;
    subjectArea: string;
    description?: string;

    constructor(bookCopies: number[],
                ISBN: string,
                author: string,
                title: string,
                publishYear: Moment,
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
    bookCopies: {type: [Number], required: true},
    ISBN: {type: String, required: true},
    author: {type: String, required: true},
    title: {type: String, required: true},
    publishYear: {type: Date, required: true},
    subjectArea: {type: String, required: true},
    description: {type: String, required: false}
});
export default function (db: Connection): void {
    db.model<DocBook>('Book', BookSchema);
}

