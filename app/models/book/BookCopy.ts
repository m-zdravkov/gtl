import {BaseModel} from '../BaseModel';
import {Connection, Document, Schema} from 'mongoose';
import {Moment} from 'moment';

export class BookCopy extends BaseModel {

    available: boolean;
    takenDate: Moment;
    expectedReturnDate: Moment;
    lendingRestrictions?: string[];

    constructor(available: boolean,
                takenDate: Moment,
                expectedReturnDate: Moment,
                lendingRestrictions?: string[]) {
        super();
        this.available = available;
        this.takenDate = takenDate;
        this.expectedReturnDate = expectedReturnDate;
        this.lendingRestrictions = lendingRestrictions;

    }
}

export interface LeanBookCopy extends BookCopy {
}

export interface DocBookCopy extends BookCopy, Document {
}

const BookCopySchema = new Schema({
    available: {type: Boolean, required: true},
    author: {type: Date, required: true},
    publishYear: {type: Date, required: true},
    lendingRestrictions: {type: [Number], required: false}});
export default function (db: Connection): void {
    db.model<DocBookCopy>('BookCopy', BookCopySchema);
}

