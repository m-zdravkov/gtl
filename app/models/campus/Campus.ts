import {Connection, Document, Schema} from 'mongoose';
import {BaseModel} from '../BaseModel';
import * as validator from 'mongoose-validators';

export class Campus extends BaseModel {
  address: string;
  name: string;


  constructor(address: string, name: string) {
    super();
    this.address = address;
    this.name = name;
  }
}

export interface DocCampus extends Document, Campus {
}

export interface LeanCampus extends Campus {
}

export const CampusSchema = new Schema({
  address: {type: String, required: true,  validate: [validator.isEmail(),
          validator.isLength(1, 255)]},
  name: {type: String, required: true, validate: [validator.isLength(1, 128)]}
});

export default function (db: Connection): void {
  db.model<DocCampus>('Campus', CampusSchema);
}
