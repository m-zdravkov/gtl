import { Connection, Document } from 'mongoose';
import { BaseModel, ObjectId } from '../models/BaseModel';
import { getMongoService} from './general/MongoService';

const errHandler = require('../components/ErrorHandler');

export type Projection = object | string;
export type Population = object | string;
export type Condition = object;
export type UpdateObject = object | string;
export type Options = object;

export class BaseService<Lean extends BaseModel, Doc extends BaseModel & Document> {
  protected db: Connection;
  private modelName: string;
  private mongoService: any;

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

  findByIdNotNull(modelId: ObjectId,
                  projection?: Projection,
                  population?: Population): Promise<Doc> {
    const model = this.findById(modelId, projection, population);
    if (model === null) {
      throw errHandler.handleErrDb(
        null,
        `Object of model ${this.modelName.toLowerCase()} with id: ${modelId} does not exist`);

    }
    return model;
  }

  findByIdLean(modelId: ObjectId,
               projection?: Projection,
               population?: Population): Promise<Lean> {
    return this.mongoService.findById(this.modelName, modelId, true, population, projection);
  }

  async findByIdLeanNotNull(modelId: ObjectId,
                            projection?: Projection,
                            population?: Population): Promise<Lean> {
    const model = await this.findByIdLean(modelId, projection, population);
    if (model === null) {
      throw errHandler.handleErrDb(
        null,
        `Object of model ${this.modelName.toLowerCase()} with id: ${modelId} does not exist`);

    }
    return model;
  }

  findByIds(modelIds: ObjectId[],
            projection?: Projection,
            population?: Population): Promise<Doc[]> {
    return this.mongoService.find(
      this.modelName, {_id: {$in: modelIds}}, false, projection, null, population);
  }

  findByIdsLean(modelIds: ObjectId[],
                projection?: Projection,
                population?: Population): Promise<Lean[]> {
    return this.mongoService.find(
      this.modelName, {_id: {$in: modelIds}}, true, projection, null, population);
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

  save(model: Doc): Promise<Doc> {
    return this.mongoService.save(model);
  }

  remove(conditions: Object): Promise<void> {
    return this.mongoService.removeModel(this.modelName, conditions);
  }

  update(conditions: Condition, updateObject: UpdateObject, options?: Options): Promise<void> {
    return this.mongoService.update(this.modelName, conditions, updateObject, options);
  }

  count(conditions: Condition): Promise<number> {
    return this.mongoService.count(this.modelName, conditions);
  }
}
