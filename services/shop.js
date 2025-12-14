import { getProducts as _getProducts, getProductById, getCart as _getCart, addToCart as _addToCart, removeFromCart as _removeFromCart, createOrder, clearCart, getOrders as _getOrders, getAddressByUserId as _getAddressByUserId, addOrUpdateAddress as _addOrUpdateAddress } from '../database/sqlite.js';
import { processCheckout } from '../util/payment.js';

export const getProducts = (page, limit) => _getProducts(page, limit);
export const getProduct = (productId) => getProductById(productId);
export const getCart = (user) => _getCart(user);
export const addToCart = (productId, user) => {
  return getProductById(productId)
    .then((product) => _addToCart(user, product));
};
export const removeFromCart = (productId, user) => _removeFromCart(user, productId);
export const checkout = (user, req) => {
  let products = [];
  let totalCost = 0;

  return _getCart(user)
    .then((cartItems) => {
      products = cartItems;
      totalCost = products.reduce((cost, p) => {
        cost += p.quantity * p.productId.price;
        return cost;
      }, 0).toFixed(2);

      return processCheckout(products, req);
    })
    .then((session) => ({ session, totalCost, products }));
};
export const processOrder = (user) => {
  return _getCart(user)
    .then((products) => {
      const mProducts = products.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId } };
      });
      return createOrder(user, mProducts);
    })
    .then(() => clearCart(user));
};
export const getOrders = (userId) => _getOrders(userId);
export const getAddressByUserId = (userId) => _getAddressByUserId(userId);
export const addOrUpdateAddress = (shipmentAddress) => _addOrUpdateAddress(shipmentAddress);

export default {
  getProducts,
  getProduct,
  getCart,
  addToCart,
  removeFromCart,
  checkout,
  processOrder,
  getOrders,
  getAddressByUserId,
  addOrUpdateAddress,
}
