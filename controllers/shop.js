import shop from '../services/shop.js'
import { catchFunc, getInt1, productLimit, Page } from './common.js'

function getProducts (req, res, next) {
  const page = getInt1(req.query.page)
  return shop.getProducts(page, productLimit).then((args) => {
      return res.render('shop/product-list', Page('Products', '/products', page, args))
    }).catch(catchFunc(next))
}

function getProduct (req, res, next) {
  return shop.getProduct(req.params.productId).then((product) => {
      return res.render('shop/product-detail', {product, pageTitle: product.title, path: '/products',})
    }).catch(catchFunc(next))
}

function getHomepage (req, res, next) {
  const page = getInt1(req.query.page)
  return shop.getProducts(page, productLimit).then((args) => {
      return res.render('shop/index', Page('Home', '/', page, args))
    }).catch(catchFunc(next))
}

function getCart (req, res, next) {
  return shop.getCart(req.user).then((products) => {
      return res.render('shop/cart', {path: '/cart', pageTitle: 'Your Cart', products,})
    }).catch(catchFunc(next))
}

function postCart (req, res, next) {
  return shop.addToCart(req.body.productId, req.user).then(() => {
      return res.redirect('/cart')
    }).catch(catchFunc(next))
}

function postCartDeleteProduct (req, res, next) {
  return shop.removeFromCart(req.body.productId, req.user).then((_result) => {
      return res.redirect('/cart')
    }).catch(catchFunc(next))
}

const stripeKey = process.env.STRIPE_PUBLISHABLE_KEY
function getCheckout (req, res, next) {
  return shop.checkout(req.user, req).then((args) => {
      return res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: args.products,
        totalSum: args.totalCost,
        sessionId: args.session.id,
        stripePublishableKey: stripeKey,
      })
    }).catch(catchFunc(next))
}

function getCheckoutSuccess (req, res, next) {
  return shop.processOrder(req.user).then(() => {
      return res.redirect('/orders');
    }).catch(catchFunc(next))
}

function getOrders (req, res, next) {
  return shop.getOrders(req.user.id).then((orders) => {
      return res.render('shop/orders', {path: '/orders', pageTitle: 'Your Orders', orders,})
    }).catch(catchFunc(next))
}

function getAbout (_req, res, _next) {
  return res.render('shop/about', {pageTitle: 'About', path: '/about',})
}

function getContact (_req, res, _next) {
  return res.render('shop/contact', {pageTitle: 'About', path: '/about',})
}

function getMyPage (req, res, next) {
  return Promise.all([ shop.getOrders(req.user.id), shop.getAddressByUserId(req.user.id), ]).then((args) => {
      return res.render('shop/mypage', {
        pageTitle: 'My Page',
        path: '/mypage',
        shipmentAddress: args[1],
        account: {email: req.user.email,},
        orders: args[0],
      })
    }).catch(catchFunc(next))
}

function getShipment (req, res, next) {
  return shop.getAddressByUserId(req.user.id).then((shipmentAddress) => {
      return res.render('shop/shipment', {pageTitle: 'Shipment', path: '/shipment', shipmentAddress,})
    }).catch(catchFunc(next))
}

function postShipment (req, res, next) {
  const u = req.body
  const shipmentAddress = {
    userId: req.user.id,
    firstname: u.firstname,
    lastname: u.lastname,
    phone: u.phone,
    address: u.address,
    postalcode: u.postalcode,
    city: u.city,
    state: u.state,
    country: u.country,
  }
  return shop.addOrUpdateAddress(shipmentAddress).then(() =>
    getMyPage(req, res, next)).catch(catchFunc(next))
}

export default {
  getProducts,
  getProduct,
  getHomepage,
  getCart,
  postCart,
  postCartDeleteProduct,
  getCheckout,
  getCheckoutSuccess,
  getOrders,
  getAbout,
  getContact,
  getMyPage,
  getShipment,
  postShipment
}
