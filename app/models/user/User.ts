import { BaseModel, ObjectIdOrRef } from '../BaseModel';
import { Connection, Schema, Document } from 'mongoose';
import { Campus } from '../campus/Campus';
import { UserType, userTypes } from '../../components/constants/models/user/userConstants';
import { BookCopy } from '../book/BookCopy';
import { MemberCard, MemberCardSchema } from './MemberCard';
import * as validator from 'mongoose-validators';

export class User extends BaseModel {
    userType: UserType;
    takenBooks: ObjectIdOrRef<BookCopy>[];
    ssn: string;
    campus: ObjectIdOrRef<Campus>;
    homeAddress: string;
    mailingAddress: string;
    phoneNumbers: string[];
    memberCard: MemberCard;


  constructor(userType: UserType, ssn: string,
              campus: ObjectIdOrRef<Campus>, homeAddress: string, mailingAddress: string,
              phoneNumbers: string[], memberCard: MemberCard, takenBooks?: ObjectIdOrRef<BookCopy>[]) {
    super();
    this.userType = userType;
    this.ssn = ssn;
    this.campus = campus;
    this.homeAddress = homeAddress;
    this.mailingAddress = mailingAddress;
    this.phoneNumbers = phoneNumbers;
    this.memberCard = memberCard;
    if (takenBooks) {
      this.takenBooks = takenBooks;
    }
  }
}

export interface LeanUser extends User {
}

export interface DocUser extends User, Document {
}

export const UserSchema = new Schema({
    userType: {type: String, required: true, 'enum': userTypes},
    takenBooks: [{type: Schema.Types.ObjectId, ref: 'BookCopy', required: false}],
    ssn: {type: String, required: true, validate: [validator.isLength(1, 10)]},
    campus: {type: Schema.Types.ObjectId, ref: 'Campus', required: false},
    homeAddress: {type: String, required: true},
    mailingAddress: {type: String, required: true, validate: validator.isEmail},
    phoneNumbers: {type: [String], required: true},
    memberCard: {type: MemberCardSchema, required: true}
});

export default function(db: Connection): void {
    db.model<DocUser>('User', UserSchema);
}
