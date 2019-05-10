import { defaultCtrlCall } from './UtilResources';
import { Request, Response } from 'express';
import {
    createWishlistItem,
    getWishlist, removeWishlistItem,
    updateWishlistItem
} from '../../controllers/book/WishlistCtrl';

module.exports = (router: any) => {

    // View compliance data
    router.post(
        '/wishlist',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, createWishlistItem, req);
        });
    router.get(
        '/wishlist',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, getWishlist, req);
        });
    router.put(
        '/wishlist/:itemId',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, updateWishlistItem, req);
        });
    router.delete(
        '/wishlist/:itemId',
        (req: Request, res: Response) => {
            return defaultCtrlCall(res, removeWishlistItem, req);
        });
};
