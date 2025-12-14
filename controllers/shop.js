import { getProducts as _getProducts, getProduct as _getProduct, getCart as _getCart, addToCart, removeFromCart, checkout, processOrder, getOrders as _getOrders, getAddressByUserId, addOrUpdateAddress } from '../services/shop.js';

export const getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  const limit = 8;

  _getProducts(page, limit)
    .then(({ count, products }) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: limit * page < count,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(count / limit),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const getProduct = (req, res, next) => {
  _getProduct(req.params.productId)
    .then((product) => {
      res.render('shop/product-detail', {
        product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const getHomepage = (req, res, next) => {
  const page = +req.query.page || 1;
  const limit = 8;

  _getProducts(page, limit)
    .then(({ count, products }) => {
      res.render('shop/index', {
        pageTitle: 'Home',
        path: '/',
        prods: products,
        currentPage: page,
        hasNextPage: limit * page < count,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(count / limit),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const getCart = (req, res, next) => {
  _getCart(req.user)
    .then((products) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const postCart = (req, res, next) => {
  addToCart(req.body.productId, req.user)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const postCartDeleteProduct = (req, res, next) => {
  removeFromCart(req.body.productId, req.user)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const getCheckout = (req, res, next) => {
  checkout(req.user, req)
    .then(({ session, totalCost, products }) => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products,
        totalSum: totalCost,
        sessionId: session.id,
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const getCheckoutSuccess = (req, res, next) => {
  processOrder(req.user)
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const getOrders = (req, res, next) => {
  _getOrders(req.user.id)
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const getAbout = (_req, res, _next) => {
  res.render('shop/about', {
    pageTitle: 'About',
    path: '/about',
  });
};
export const getContact = (_req, res, _next) => {
  res.render('shop/contact', {
    pageTitle: 'About',
    path: '/about',
  });
};
export const getMyPage = (req, res, next) => {
  Promise.all([
    _getOrders(req.user.id),
    getAddressByUserId(req.user.id),
  ])
    .then(([orders, shipmentAddress]) => {
      res.render('shop/mypage', {
        pageTitle: 'My Page',
        path: '/mypage',
        shipmentAddress,
        account: { email: req.user.email },
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const getShipment = (req, res, next) => {
  getAddressByUserId(req.user.id)
    .then((shipmentAddress) => {
      res.render('shop/shipment', {
        pageTitle: 'Shipment',
        path: '/shipment',
        shipmentAddress,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
export const postShipment = (req, res, next) => {
  const { firstname, lastname, phone, address, postalcode, city, state, country } = req.body;
  const shipmentAddress = {
    userId: req.user.id,
    firstname, lastname, phone, address, postalcode, city, state, country
  };

  addOrUpdateAddress(shipmentAddress)
    .then(() => getMyPage(req, res, next))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

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
};
