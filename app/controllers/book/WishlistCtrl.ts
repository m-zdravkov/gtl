import {Request} from 'express';
import {getConnection} from '../../components/database/DbConnect';
import {ErrorHandler} from '../../components/ErrorHandler';
import {DocWishlistItem} from '../../models/book/WishlistItem';
import {WishlistService} from '../../services/book/WishlistService';

export async function createWishlistItem(req: Request): Promise<DocWishlistItem> {
    // TODO: Fix error handler
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

export async function updateWishlistItem(req: Request): Promise<DocWishlistItem> {
    // TODO: Fix error handler
    const itemId = req.params.itemId;
    const db = await getConnection();
    const wishlistService = new WishlistService(db);
    const existingItem = await wishlistService.findById(itemId);

    Object.keys(req.body).map(key => {
        existingItem[key] = req.body[key];
    });
    await existingItem.save();
    return existingItem;
}

export async function removeWishlistItem(req: Request): Promise<void> {
    const itemId = req.params.itemId;
    const db = await getConnection();
    const wishlistService = new WishlistService(db);

    return wishlistService.remove({_id: itemId});
}

