import { BaseModel, ObjectIdOrRef } from '../BaseModel';
import {Connection, Document, Schema} from 'mongoose';
import {Moment} from 'moment';
import { Book } from './Book';
import {NextFunction} from 'express';

export class BookCopy extends BaseModel {

    available: boolean;
    takenDate: Moment;
    bookId: ObjectIdOrRef<Book>;
    expectedReturnDate: Moment;
    reminderSent?: boolean;

    constructor(available: boolean,
                expectedReturnDate: Moment,
                bookId: ObjectIdOrRef<Book>,
                takenDate?: Moment) {
        super();
        this.available = available;
        this.expectedReturnDate = expectedReturnDate;
        this.bookId = bookId;
        if (takenDate) {
            this.takenDate = takenDate;
        }

    }
}

export interface LeanBookCopy extends BookCopy {
}

export interface DocBookCopy extends BookCopy, Document {
}

const BookCopySchema = new Schema({
  available: {type: Boolean, required: true, default: true},
  takenDate: {type: Date, required: false},
  bookId: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
  expectedReturnDate: {type: Date, required: false},
  reminderSent: {type: Boolean, required: false}
});

BookCopySchema.pre('save', async function (next: NextFunction): Promise<void> {
    await this.populate('bookId').execPopulate();
    if (!this.bookId) {
        const err = new Error('Book doesn\'t exist');
        await this.depopulate('bookId');
        next(err);
    }
    await this.depopulate('bookId');
    next();
});

export default function (db: Connection): void {
    db.model<DocBookCopy>('BookCopy', BookCopySchema);
}

