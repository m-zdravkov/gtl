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

export class Audit extends BaseModel {
  action: ActionType;
  model: ModelType;
  createTime: Moment;
  email?: string;
  firstName?: string;
  lastName?: string;
  // TODO userId?: ObjectIdOrRef<User>;
  newValue?: string;
  oldValue?: string;
  newObject?: object;
  oldObject?: object;
  modelId?: ObjectIdOrRef<string>;
}

// @ts-ignore
export interface DocAudit extends Document, Audit {
  // TODO userId?: ObjectIdOrRef<User>;
}

export interface LeanAudit extends Audit {
  // TODO userId?: ObjectIdOrRef<User>;
  model: string;
}

export const AuditSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: 'User', required: false},
  firstName: {type: String, required: false},
  lastName: {type: String, required: false},
  email: {
    type: String,
    required: false,
    validate: [validator.isEmail()]
  },
  model: {
    type: String, required: true,
    'enum': models
  },
  modelId: {type: Schema.Types.ObjectId, required: false},
  action: {
    type: String, required: true,
    'enum': actions
  },
  newValue: {type: String, required: false},
  oldValue: {type: String, required: false},
  newObject: {type: Object, required: false},
  oldObject: {type: Object, required: false},
  createTime: {type: Date, required: true}
});

export default function (db: Connection): void {
  db.model<DocAudit>('Audit', AuditSchema);
}