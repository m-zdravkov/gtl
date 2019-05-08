import {BaseModel} from '../BaseModel';
import {Connection, Document, Schema} from 'mongoose';
import {Book} from './Book';

export class WishlistItem extends BaseModel {

    book: Book;
    numOfCopies: number;
    reason?: string;

    constructor(    book: Book,
                    numOfCopies: number,
                    reason?: string) {
        super();
        this.book = book;
        this.numOfCopies = numOfCopies;
        this.reason = reason;

    }
}

export interface LeanWishlistItem extends WishlistItem {
}

export interface DocWishlistItem extends WishlistItem, Document {
}

const WishlistItemSchema = new Schema({
    book: {type: Book, required: true},
    numOfCopies: {type: Number, required: true},
    reason: {type: String, required: false}
});
export default function (db: Connection): void {
    db.model<DocWishlistItem>('WishlistItem', WishlistItemSchema);
}

