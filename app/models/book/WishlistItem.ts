import {BaseModel} from '../BaseModel';
import {Connection, Document, Schema} from 'mongoose';

export class WishlistItem extends BaseModel {

    bookId: number;
    numOfCopies: number;
    reason?: string;

    constructor(    bookId: number,
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
    bookId: {type: Number, required: true},
    numOfCopies: {type: Number, required: true},
    reason: {type: String, required: false}
});
export default function (db: Connection): void {
    db.model<DocWishlistItem>('WishlistItem', WishlistItemSchema);
}

