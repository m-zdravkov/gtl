import { Connection, Document } from 'mongoose';
import { BaseModel, ObjectId } from '../models/BaseModel';
import { getMongoService} from './general/MongoService';
import { ErrorHandler } from '../components/ErrorHandler';

export type Projection = object | string;
export type Population = object | string;
export type Condition = object;
export type UpdateObject = object | string;
export type Options = object;

export class BaseService<Lean extends BaseModel, Doc extends BaseModel & Document> {
  protected db: Connection;
  private readonly modelName: string;
  protected mongoService: any;

  constructor(modelName: string, db: Connection) {
    this.modelName = modelName;
    this.db = db;
    this.mongoService = getMongoService(db);
  }

  findById(modelId: ObjectId,
           projection?: Projection,
           population?: Population): Promise<Doc> {
    return this.mongoService.findById(this.modelName, modelId, false, population, projection);
  }

  findByIdLean(modelId: ObjectId,
               projection?: Projection,
               population?: Population): Promise<Lean> {
    return this.mongoService.findById(this.modelName, modelId, true, population, projection);
  }

  find(conditions: Condition,
       projection?: Projection,
       population?: Population): Promise<Doc[]> {
    return this.mongoService.find(
      this.modelName, conditions, false, projection, null, population);
  }

  findLean(conditions: Condition,
           projection?: Projection,
           population?: Population): Promise<Lean[]> {
    return this.mongoService.find(
      this.modelName, conditions, true, projection, null, population);
  }

  findOne(
    conditions: Condition,
    projection?: Projection,
    population?: Population): Promise<Doc> {
    return this.mongoService.findOne(
      this.modelName, conditions, false, projection, null, population);
  }

  findOneLean(
    conditions: Condition,
    projection?: Projection,
    population?: Population): Promise<Lean> {
    return this.mongoService.findOne(
      this.modelName, conditions, true, projection, null, population);
  }

  remove(conditions: Object): Promise<void> {
    return this.mongoService.removeModel(this.modelName, conditions);
  }

  update(conditions: Condition, updateObject: UpdateObject, options?: Options): Promise<void> {
    return this.mongoService.update(this.modelName, conditions, updateObject, options);
  }

  updateMany(conditions: Condition, updateObject: UpdateObject, options?: Options): Promise<void> {
    return this.mongoService.getModel(this.modelName).updateMany(conditions, updateObject, options);
  }

  count(conditions: Condition): Promise<number> {
    return this.mongoService.count(this.modelName, conditions);
  }

  /**
   * Creates a document from the provided request body, for the service's model reference
   * @param reqBody The object that contains all fields required to create the model object
   */
  create(reqBody: any): Doc {
    const model = this.mongoService.getModel(this.modelName);
    return new model(reqBody);
  }
}
