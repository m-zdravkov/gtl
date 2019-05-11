import {Request} from 'express';
import {getConnection} from '../../components/database/DbConnect';
import {ErrorHandler} from '../../components/ErrorHandler';
import {DocWishlistItem} from '../../models/book/WishlistItem';
import {WishlistService} from '../../services/book/WishlistService';

export async function createWishlistItem(req: Request): Promise<DocWishlistItem> {
    // TODO: Validate that the book exists.
    const fName = 'WishlistCtrl.createWishlistItem';
    const reqBody = req.body;
    const db = await getConnection();
    const wishlistService = new WishlistService(db);
    try {
        return wishlistService.create(reqBody).save();
    } catch (e) {
        throw ErrorHandler.handleErrValidation(fName, e.msg, e.inner);
    }
}

export async function getWishlist(): Promise<DocWishlistItem[]> {
    const db = await getConnection();
    const wishlistService = new WishlistService(db);
    return wishlistService.find({}, undefined, 'bookId');
}

export async function updateWishlistItem(req: Request): Promise<void> {
    // TODO: Add validation for the body
    //  And check that the 'new' book doesn't exist in a wishlist item already.
    const reqBody = req.body;
    const itemId = req.params.itemId;
    const db = await getConnection();
    const wishlistService = new WishlistService(db);
    return wishlistService.update({_id: itemId}, reqBody);
}

export async function removeWishlistItem(req: Request): Promise<void> {
    const itemId = req.params.itemId;
    const db = await getConnection();
    const wishlistService = new WishlistService(db);

    return wishlistService.remove({_id: itemId});
}

