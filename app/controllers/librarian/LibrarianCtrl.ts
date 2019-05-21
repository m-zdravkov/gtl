import { Request } from 'express';
import {DocLibrarian} from '../../models/librarian/Librarian';
import {getConnection} from '../../components/database/DbConnect';
import {LibrarianService} from '../../services/librarian/LibrarianService';
import {ErrorHandler} from '../../components/ErrorHandler';

export async function getLibrarians(req: Request): Promise<DocLibrarian[]> {
    const name = req.query.name;
    const db = await getConnection();
    const librarianService = new LibrarianService(db);
    if (name) {
        return librarianService.find({name: name});
    } else {
        return librarianService.find({});
    }
}

export async function createLibrarian(req: Request): Promise<DocLibrarian> {
    const fName = 'LibrarianCtrl.createLibrarian';
    const name = req.query.name;
    const db = await getConnection();
    const librarianService = new LibrarianService(db);
    try {
        return librarianService.create(req.body).save();
    } catch (e) {
        throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
    }
}
