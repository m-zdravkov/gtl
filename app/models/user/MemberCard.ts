import {BaseModel} from '../BaseModel';
import {Connection, Schema, Document} from 'mongoose';
import {Moment} from 'moment';

export class MemberCard extends BaseModel {
    expirationDate: Moment;
    notificationSendoutDate: Moment;
    isNotificationSent: Boolean;

}

export interface LeanMemberCard extends MemberCard {
}

export interface DocMemberCard extends MemberCard, Document {
}

const MemberCardSchema = new Schema({
    expirationDate: {type: Date, required: true},
    notificationSendoutDate: {type: Date, required: true},
    isNotificationSent: {type: Boolean, required: true, default: false}
});