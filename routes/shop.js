import { Router } from 'express';
import { getHomepage, getAbout, getContact, getProducts, getMyPage, getProduct, getCart, postCart, postCartDeleteProduct, getCheckout, getCheckoutSuccess, getOrders, getShipment, postShipment } from '../controllers/shop.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const shopRouter = Router();

shopRouter.get('/', getHomepage);
shopRouter.get('/about', getAbout);
shopRouter.get('/contact', getContact);
shopRouter.get('/products', getProducts);
shopRouter.get('/mypage', isAuthenticated, getMyPage);
shopRouter.get('/products/:productId', getProduct);
shopRouter.get('/cart', isAuthenticated, getCart);
shopRouter.post('/cart', isAuthenticated, postCart);
shopRouter.post('/cart-delete-item', isAuthenticated, postCartDeleteProduct);
shopRouter.get('/checkout', isAuthenticated, getCheckout);
shopRouter.get('/checkout/success', getCheckoutSuccess);
shopRouter.get('/checkout/cancel', getCheckout);
shopRouter.get('/orders', isAuthenticated, getOrders);
shopRouter.get('/shipment', isAuthenticated, getShipment);
shopRouter.post('/shipment', isAuthenticated, postShipment);

export default shopRouter;
