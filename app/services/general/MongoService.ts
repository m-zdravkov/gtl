import { Connection, Document, Model, Query } from 'mongoose';
import { ErrorHandler } from '../../components/ErrorHandler';
import { ObjectId } from '../../models/BaseModel';
import { Condition, Options, Population, Projection } from '../BaseService';

import { constants } from '../../components/constants';

export let getMongoService: (db: Connection) => MongoService = (db) => {
  if (!instance) {
    return new MongoService(db);
  }
  return instance;
};

let instance: MongoService = null;

class MongoService {
  private db: Connection;

  constructor(db: Connection) {
    this.db = db;
  }

  getModel: <T extends Document>(modelName: string) => Model<T> =
    <T extends Document>(modelName: string): Model<T> => {
      return this.db.model(modelName);
    };

  findById: <T extends Document>(
    modelName: string, modelId: ObjectId, lean?: boolean, populate?: Population,
    projection?: Projection) => Promise<T> =
    <T extends Document>(modelName: string, modelId: ObjectId, lean?: boolean,
                         populate?: Population, projection?: Projection): Promise<T> => {

      const DbModel = this.db.model(modelName);

      // Type any as query lean type definitions are incomplete
      let query: any = DbModel.findById(modelId);
      if (populate) {
        query = query.populate(populate);
      }

      if (lean) {
        query = query.lean();
      }
      if (projection) {
        query = query.select(projection);
      }

      return ((query.exec()) as Promise<T>).catch(err => {
        throw ErrorHandler.handleErrDb(
          null, `Could not fetch ${modelName.toLowerCase()} model for id: ${modelId}`, err);
      });
    };

  findByIdNotNull = async <T extends Document>(
    modelName: string, modelId: ObjectId, lean?: boolean, populate?: Population,
    projection?: Projection, noLogging?: boolean): Promise<T> => {
    const model = await this.findById<T>(modelName, modelId, lean, populate, projection);
    if (model === null) {
      if (noLogging) {
        throw  `Could not fetch ${modelName.toLowerCase()} model for id: ${modelId}`;
      } else {
        ErrorHandler.handleErrDb(
          null, `Could not fetch ${modelName.toLowerCase()} model for id: ${modelId}`);
      }
    }
    return model;
  };

  findOne = async <T extends Document>(
    modelName: string, conditions: Condition, lean?: boolean, fields?: Projection,
    options?: any, populate?: Population): Promise<T> => {
    options = options || {};
    options.limit = 1;

    const models = await this.find(modelName, conditions, lean, fields, options, populate);
    if (models && models.length > 0) {
      return <T>models[ 0 ];
    }

    return null;
  };

  find = async <T extends Document>(
    modelName: string, conditions: Condition, lean?: boolean, fields?: Projection,
    options?: Options, populate?: Population): Promise<void | T[]> => {
    const DbModel = this.db.model<T>(modelName);

    let query = DbModel.find(conditions, fields, options) as Query<Object>;
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(el => query.populate(el));
      } else {
        if (typeof populate === 'string' || typeof populate === 'object') {
          query = query.populate(populate);
        }
      }
    }

    if (lean) {
      query = query.lean();
    }

    return ((query.exec()) as Promise<T[]>).catch(err => {
      throw ErrorHandler.handleErrDb(
        null,
        `Could not fetch ${modelName.toLowerCase()} models. Query params used: ${conditions}`, err);
    });
  };

  update = async (modelName: string, conditions: Condition, update: object): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      let DbModel = this.db.model(modelName);

      resolve(DbModel.findOneAndUpdate(conditions, update)
        .exec()
        .catch(err => {
          throw ErrorHandler.handleErr(
            null,
            `Could not update ${modelName.toLowerCase()} models. Conditions: ` +
            `${conditions} update: ${update}`,
            constants.errType.DB, 400, err);
        }));
    });
  };

  removeModel = async (modelName: string, conditions: Condition): Promise<any> => {
    let DbModel = await this.db.model(modelName);

    return DbModel
      .remove(conditions)
      .catch(err => {
        ErrorHandler.handleErr(
          null,
          `Could not remove ${modelName.toLowerCase()} models. Conditions: ${conditions}`,
          constants.errType.DB, 400, err);
      });
  };

  count = async (modelName: string, conditions: object): Promise<number> => {
    return await this.db.model(modelName)
      .count(conditions)
      .exec()
      .catch(err => {
        throw ErrorHandler.handleErrDb(
          'MongoService.count',
          `Could not count the model ${modelName}`, err);
      });
  }
}

/**
 * Delete the object attributes that are null or undefined
 *
 * @param {Object} obj The object to be cleaned
 * @returns {Object} obj A clean version of the object
 */
export function cleanObject(obj: any): object {
  for (let propName in obj) {
    if (obj.hasOwnProperty(propName) && obj[ propName ] === null || obj[ propName ] === undefined) {
      delete obj[ propName ];
    }
  }

  return obj;
}
