import { BaseModel, ObjectIdOrRef } from '../BaseModel';
import { Connection, Document, Schema } from 'mongoose';
import * as validator from 'mongoose-validators';
import {
  ActionType,
  actions,
  ModelType,
  models
} from '../../components/constants/models/audit/auditConstants';
import { Moment } from 'moment';
import { User } from '../user/User';

export class Audit extends BaseModel {
  action: ActionType;
  model: ModelType;
  createTime: Moment;
  userId?: ObjectIdOrRef<User>;
  newObject?: object;
  oldObject?: object;
  modelId?: ObjectIdOrRef<string>;
}

// @ts-ignore
export interface DocAudit extends Document, Audit {
}

export interface LeanAudit extends Audit {
  model: string;
}

export const AuditSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: 'User', required: false},
  model: {
    type: String, required: true,
    'enum': models
  },
  modelId: {type: Schema.Types.ObjectId, required: false},
  action: {
    type: String, required: true,
    'enum': actions
  },
  newObject: {type: Object, required: false},
  oldObject: {type: Object, required: false},
  createTime: {type: Date, required: true}
});

export default function (db: Connection): void {
  db.model<DocAudit>('Audit', AuditSchema);
}
