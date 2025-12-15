import db from '../database/sqlite.js';
import { processCheckout } from '../util/payment.js';

export function getProducts (page, limit) {
  return db.getProducts(page, limit)
}

export function getProduct (productId) {
  return db.getProductById(productId)
}

export function getCart (user) {
  return db.getCart(user)
}

export function addToCart (productId, user) {
  return db.getProductById(productId)
    .then((product) => db.addToCart(user, product));
}

export function removeFromCart (productId, user) {
  return db.removeFromCart(user, productId)
}

export function checkout (user, req) {
  let products = [];
  let totalCost = 0;

  return db.getCart(user)
    .then((cartItems) => {
      products = cartItems;
      totalCost = products.reduce((cost, p) => {
        cost += p.quantity * p.productId.price;
        return cost;
      }, 0).toFixed(2);

      return processCheckout(products, req);
    })
    .then((session) => ({ session, totalCost, products }));
}

export function processOrder (user) {
  return db.getCart(user)
    .then((products) => {
      const mProducts = products.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId } };
      });
      return db.createOrder(user, mProducts);
    })
    .then(() => db.clearCart(user));
}

export function getOrders (userId) {
  return db.getOrders(userId)
}

export function getAddressByUserId (userId) {
  return db.getAddressByUserId(userId)
}

export function addOrUpdateAddress (shipmentAddress) {
  return db.addOrUpdateAddress(shipmentAddress)
}

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
