import {BaseModel} from '../BaseModel';
import { Schema, Document } from 'mongoose';
import {Moment} from 'moment';

export class MemberCard extends BaseModel {
    expirationDate: Moment;
    notificationSendoutDate: Moment;
    isNotificationSent: boolean;


  constructor(expirationDate: Moment, notificationSendoutDate: Moment,
              isNotificationSent: boolean) {
    super();
    this.expirationDate = expirationDate;
    this.notificationSendoutDate = notificationSendoutDate;
    this.isNotificationSent = isNotificationSent;
  }
}

export interface LeanMemberCard extends MemberCard {
}

export interface DocMemberCard extends MemberCard, Document {
}

export const MemberCardSchema = new Schema({
    expirationDate: {type: Date, required: true},
    notificationSendoutDate: {type: Date, required: true},
    isNotificationSent: {type: Boolean, required: true, default: false}
});
