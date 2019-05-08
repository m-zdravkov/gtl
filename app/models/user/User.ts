import { BaseModel } from '../BaseModel';
import { Connection, Schema, Document } from 'mongoose';
import { Campus } from '../campus/Campus';
import { UserType } from './UserType';
import { BookCopy } from '../book/BookCopy';
import * as validator from 'mongoose-validators';

export class User extends BaseModel {
    userType: UserType;
    takenBooks: Array<BookCopy._id>;
    ssn: string;
    campus: Campus['_id'];
    homeAddress: string;
    mailingAddress: string;
    phoneNumbers: Array<string>;
}

export interface LeanUser extends User {
}

export interface DocUser extends User, Document {
}

export const UserSchema = new Schema({
    userType: {type: String, required: true, default: 'NormalUser'},
    takenBooks: {type: [String], required: false},
    ssn: {type: String, required: true, validate: [validator.isLength(1, 10)]},
    campus: {type: String, required: false},
    homeAddress: {type: String, required: false},
    mailingAddress: {type: String, required: false},
    phoneNumbers: {type: [String], required: false}
});

export default function (db:Connection): void {
    db.model<DocUser>('User', UserSchema);
}