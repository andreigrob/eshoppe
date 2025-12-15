import { Router } from 'express';
import ct from '../controllers/shop.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const shopRouter = Router();

shopRouter.get('/', ct.getHomepage);
shopRouter.get('/about', ct.getAbout);
shopRouter.get('/contact', ct.getContact);
shopRouter.get('/products', ct.getProducts);
shopRouter.get('/mypage', isAuthenticated, ct.getMyPage);
shopRouter.get('/products/:productId', ct.getProduct);
shopRouter.get('/cart', isAuthenticated, ct.getCart);
shopRouter.post('/cart', isAuthenticated, ct.postCart);
shopRouter.post('/cart-delete-item', isAuthenticated, ct.postCartDeleteProduct);
shopRouter.get('/checkout', isAuthenticated, ct.getCheckout);
shopRouter.get('/checkout/success', ct.getCheckoutSuccess);
shopRouter.get('/checkout/cancel', ct.getCheckout);
shopRouter.get('/orders', isAuthenticated, ct.getOrders);
shopRouter.get('/shipment', isAuthenticated, ct.getShipment);
shopRouter.post('/shipment', isAuthenticated, ct.postShipment);

export default shopRouter;
