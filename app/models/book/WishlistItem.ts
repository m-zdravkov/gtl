import {BaseModel, ObjectIdOrRef} from '../BaseModel';
import {Connection, Document, Schema} from 'mongoose';
import { Book } from './Book';
import {NextFunction} from 'express';
import * as validator from 'mongoose-validators';


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
    bookId: {type: Schema.Types.ObjectId, ref: 'Book', required: true, unique: true
    },
    numOfCopies: {type: Number, required: true},
    reason: {type: String, required: false, validate: validator.isLength(1, 255)}
});

WishlistItemSchema.pre('save', async function (next: NextFunction): Promise<void> {
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
    db.model<DocWishlistItem>('WishlistItem', WishlistItemSchema);
}

