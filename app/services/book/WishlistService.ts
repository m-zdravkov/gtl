import { Connection } from 'mongoose';
import { BaseService } from '../BaseService';
import {DocWishlistItem, LeanWishlistItem} from '../../models/book/WishlistItem';

export class WishlistService extends BaseService<LeanWishlistItem, DocWishlistItem> {
    constructor(db: Connection) {
        super('WishlistItem', db);
    }
}
