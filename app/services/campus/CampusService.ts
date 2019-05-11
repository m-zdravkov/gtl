import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import { DocCampus, LeanCampus } from '../../models/campus/Campus';

export class CampusService extends BaseService<LeanCampus, DocCampus> {
  constructor(db: Connection) {
    super('Campus', db);
  }
}
