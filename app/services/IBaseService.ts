import { Document } from 'mongoose';
import { IBaseModel, ObjectId } from '../models/BaseModel';

export type Projection = object | string;
export type Population = object | string;
export type Condition = object;
export type UpdateObject = object | string;
export type Options = object;

export interface IBaseService<Lean extends IBaseModel, Doc extends IBaseModel & Document> {

  findById(modelId: ObjectId,
           projection?: Projection,
           population?: Population): Promise<Doc>;

  findByIdLean(modelId: ObjectId,
               projection?: Projection,
               population?: Population): Promise<Lean>;

  find(conditions: Condition,
       projection?: Projection,
       population?: Population): Promise<Doc[]>;

  findLean(conditions: Condition,
           projection?: Projection,
           population?: Population): Promise<Lean[]>;

  findOne(
    conditions: Condition,
    projection?: Projection,
    population?: Population): Promise<Doc>

  findOneLean(
    conditions: Condition,
    projection?: Projection,
    population?: Population): Promise<Lean>;

  remove(conditions: Object): Promise<void>;

  update(conditions: Condition, updateObject: UpdateObject, options?: Options): Promise<void>;

  updateMany(conditions: Condition, updateObject: UpdateObject, options?: Options): Promise<void>;

  count(conditions: Condition): Promise<number>;

  create(reqBody: any): Doc;
}
