import { Types } from 'mongoose';
import { ObjectID } from 'mongodb';

export abstract class BaseModel {
  _id: any;
}

export type ObjectId = ObjectID | Types.ObjectId;

export type ObjectIdOrRef<T> = ObjectId | string | T;

export function isObjOrRefEquals(a: ObjectIdOrRef<any>, b: ObjectIdOrRef<any>): boolean {
  return (a instanceof String) ? a === b : a.equals(b);
}
