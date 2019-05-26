import {BaseService} from '../BaseService';
import {DocLibrarian, LeanLibrarian} from '../../models/librarian/Librarian';
import {Connection} from 'mongoose';

export class LibrarianService extends BaseService<LeanLibrarian, DocLibrarian> {
    constructor(db: Connection) {
        super('Librarian', db);
    }
}
