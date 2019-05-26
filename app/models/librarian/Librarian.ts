import { BaseModel} from '../BaseModel';
import { Connection, Schema, Document } from 'mongoose';
import {LibrarianType, librarianTypes}
from '../../components/constants/models/librarian/librarianConstants';

export class Librarian extends BaseModel {
    librarianType: LibrarianType;
    name: string;

    constructor(librarianType: LibrarianType, name: string) {
        super();
        this.librarianType = librarianType;
        this.name = name;
    }
}

export interface LeanLibrarian extends Librarian {
}

export interface DocLibrarian extends Librarian, Document {
}

export const LibrarianSchema = new Schema({
    librarianType: {type: String, required: true, 'enum': librarianTypes},
    name: [{type: String, required: true}]
});

export default function(db: Connection): void {
    db.model<DocLibrarian>('Librarian', LibrarianSchema);
}
