import { BaseModel, ObjectIdOrRef } from '../BaseModel';
import {Connection, Document, Schema} from 'mongoose';
import { Book } from './Book';

export class WishlistItem extends BaseModel {

    bookId: ObjectIdOrRef<Book>;
    numOfCopies: number;
    reason?: string;

    constructor(bookId: ObjectIdOrRef<Book>,
                numOfCopies: number,
                reason?: string) {
        super();
        this.bookId = bookId;
        this.numOfCopies = numOfCopies;
        this.reason = reason;

    }
}

export interface LeanWishlistItem extends WishlistItem {
}

export interface DocWishlistItem extends WishlistItem, Document {
}

const WishlistItemSchema = new Schema({
    bookId: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
    numOfCopies: {type: Number, required: true},
    reason: {type: String, required: false}
});
export default function (db: Connection): void {
    db.model<DocWishlistItem>('WishlistItem', WishlistItemSchema);
}

