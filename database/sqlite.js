'use strict'

import dotenv from 'dotenv'
dotenv.config({ path: './w3s-dynamic-storage/.env' })
import bcrypt from 'bcryptjs'
import { v4 } from 'uuid'
import moment from 'moment'
import Sql from 'better-sqlite3'
import { resolve as _resolve } from 'path'

/** @type {string} */
const dbPath = process.env.SQLITE_DB
if (!dbPath) {
  throw new Error('Missing env SQLITE_DB')
}

const db = new Sql(_resolve(dbPath), { fileMustExist: false })

function uuid () {
  return v4()
}

/** @param {unknown} v @param {any} fallback */
function safeJsonParse(v, fallback) {
  if (typeof v !== 'string') {
    return fallback
  }
  try {
    return JSON.parse(v)
  } catch {
    return fallback
  }
}

/** @param {string} str */
function lc (str) {
  return String(str || '').trim().toLowerCase()
}

const dropQueries = [
  'drop table ShipmentAddresses',
  'drop table Products',
  'drop table Orders',
  'drop table Users',
]


const createTableQueries = [
  `create table if not exists Users (id text primary key, email text not null, password text not null, role text not null default '', resetToken text not null default '', cart text not null default '{"items":[]}')`,
  'create table if not exists ShipmentAddresses (id text primary key, userId text unique, address text not null, foreign key (userId) references Users(id) on delete cascade)',
  `create table if not exists Products (id text primary key, title text not null, price decimal(10, 2) not null, description text not null default '', imageUrl text not null default '', imageKey text not null default '', details longtext not null default '')`,
  'create table if not exists Orders (id text primary key, userId text not null, email text not null, date text not null, products text not null, foreign key (userId) references Users(id) on delete cascade)',
]

const createTableSql = createTableQueries.map((q) => db.prepare(q))

export function initialize () {
  /*dropQueries.forEach((q) => {
    db.prepare(q).run()
  })*/
  createTableSql.forEach((q) => { q.run() })
  return Promise.resolve(db)
}

function reject (r, e, m) {
  console.log(m, e)
  r(e)
}

const newProductSql = db.prepare('insert into Products (Id, Title, Price, Description, Details, ImageUrl, ImageKey) values (?, ?, ?, ?, ?, ?, ?)')
export function addProduct (p) {
  return new Promise((resolve, r) => {
    try {
      newProductSql.run(uuid(), p.title, p.price, p.description, p.details, p.imageUrl, p.imageKey)
      resolve(true)
    } catch (e) {
      reject(r, e, 'Failed to add new product')
    }
  })
}

const readProductSql = db.prepare('select * from Products where Id = ?')
export function getProductById (id) {
  return new Promise((resolve, r) => {
    try {
      resolve(readProductSql.get(id))
    } catch (e) {
      reject(r, e, 'Failed to read product with id ' + id)
    }
  })
}

const updateProductSql = db.prepare('update Products set (Title, Price, Description, Details, ImageUrl, ImageKey) = (?, ?, ?, ?, ?, ?) where Id = ?')
export function updateProduct (p) {
  return getProductById(p.productId).then((product) => {
      if (!product) {
        throw new Error('Product not found')
      }
      updateProductSql.run(p.title, p.price, p.description, p.details, p.imageUrl || product.imageUrl, p.imageKey || product.imageKey, p.productId)
      return true
    }).catch((e) => {
      console.log('Failed to update product', e)
      throw e
    })
}

const countProductsSql = db.prepare('select count(*) as Count from Products')
const readProductsSql = db.prepare('select * from Products limit ? offset ?')
export function getProducts (page, limit) {
  return new Promise((resolve, r) => {
    try {
      const products = readProductsSql.all(limit, (page - 1) * limit) || [];
      resolve({ count: countProductsSql.get().Count || 0, products });
    } catch (e) {
      reject(r, e, 'Failed to get products')
    }
  })
}

const deleteProductSql = db.prepare('delete from Products where Id = ?')
export function deleteProduct (id) {
  return new Promise((resolve, r) => {
    try {
      deleteProductSql.run(id)
      resolve(true)
    } catch (e) {
      reject(r, e, 'Failed to delete product')
    }
  })
}

export function removeProductFromCart (_productId) {
  // Removed from while fetching the cart items.
}

export function getUserBySearchParam (param) {
  return new Promise((resolve, r) => {
    try {
      const condition = Object.keys(param).map((k) => `${k} = '${param[k]}'`).join(' AND ')
      const user = db.prepare(`select * from Users where ${condition}`).get()
      resolve(user)
    } catch (e) {
      console.error(e)
      r(e)
    }
  })
}

export function validateLogin (email, password) {
  let user
  return getUserBySearchParam({ email }).then((userInfo) => {
      user = userInfo
      return user ? bcrypt.compare(password, user.password) : false
    }).then((match) => ({ match, user })).catch((e) => {
      console.log('Failed to validate login', e)
      throw e
    })
}
const signupSql = db.prepare('insert into Users (id, email, password, role) values (?, ?, ?, ?)');
export function signup (user) {
  return bcrypt.hash(user.password, 12).then((password) => {
      signupSql.run(uuid(), user.email, password, user.role || '')
      return true
    }).catch((e) => {
      console.log('Failed to signup', e)
      throw e
    })
}

const addAdminUser = signup
/*const addAdminUser = (user) => {
  return bcrypt.hash(user.password, 12)
    .then((hashedPassword) => {
      const stmt = db.prepare('INSERT INTO Users (id, email, password, role) VALUES (?, ?, ?, ?)');
      stmt.run(uuid(), user.email, hashedPassword, user.role || '');
      return true;
    })
    .catch((err) => {
      console.log('Failed to add admin user', err);
      throw err;
    });
};*/

const updateTokenSql = db.prepare('update Users set resetToken = ? where email = ?')
export function attachResetPasswordToken (email, token) {
  return getUserBySearchParam({ email }).then((user) => {
      if (!user) {
        throw new Error('No account with the provided email address exists.')
      }
      updateTokenSql.run(token, email)
      return true
    }).catch((e) => {
      console.log('Failed to attach reset password token', e)
      throw e
    })
}

export const resetPassword = (userId, password, resetToken) => {
  return getUserBySearchParam({ id: userId, resetToken })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      const stmt = db.prepare('UPDATE Users SET password = ?, resetToken = ? WHERE id = ?');
      stmt.run(hashedPassword, '', userId);
      return true;
    })
    .catch((err) => {
      console.log('Failed to reset password', err);
      throw err;
    });
};
const deleteAdminUser = (userEmail) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare('DELETE FROM Users WHERE email = ? AND role = ?');
      stmt.run(userEmail, 'admin');
      resolve(true);
    } catch (err) {
      console.log('Failed to delete admin user', err);
      reject(err)
    }
  });
}
export const createOrder = (user, products) => {
  return new Promise((resolve, reject) => {
    try {
      const orderId = uuid();
      const date = moment().format('YYYY-MM-DD');
      const stmt = db.prepare('INSERT INTO Orders (id, userId, email, date, products) VALUES (?, ?, ?, ?, ?)');
      stmt.run(orderId, user.id, user.email, date, JSON.stringify(products));
      resolve(true);
    } catch (err) {
      console.log('Failed to create order', err);
      reject(err)
    }
  });
};
export const getOrders = (userId) => {
  return new Promise((resolve, reject) => {
    try {
      const orders = db.prepare(`SELECT * from Orders WHERE userId = ?`).all(userId);
      orders.forEach((o) => {
        o.user = {
          email: o.email,
          userId: o.userId
        };
        o.products = JSON.parse(o.products);
      });
      resolve(orders);
    } catch (dbError) {
      console.error(dbError);
      reject(dbError);
    }
  });
};
export const addToCart = (user, product) => {
  return getUserBySearchParam({ email: user.email })
    .then((userInfo) => {
      const cart = JSON.parse(userInfo.cart || '{"items":[]}');
      const cartProductIndex = cart.items.findIndex((cp) => cp.productId.toString() === product.id.toString());
      const updatedCartItems = [...cart.items];
      let newQuantity = 1;

      if (cartProductIndex >= 0) {
        newQuantity = cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
      } else {
        updatedCartItems.push({
          productId: product.id,
          quantity: newQuantity,
        });
      }
      const updatedCart = {
        items: updatedCartItems,
      };
      const stmt = db.prepare('UPDATE Users SET cart = ? WHERE email = ?');

      stmt.run(JSON.stringify(updatedCart), user.email);
      return true;
    });
};
export const getCart = (user) => {
  let cartProducts;
  return getUserBySearchParam({ email: user.email })
    .then((userInfo) => {
      const cart = JSON.parse(userInfo.cart || '{"items":[]}');
      cartProducts = cart.items;
      return Promise.all(cart.items.map((item) => getProductById(item.productId)));
    })
    .then((products) => {
      return cartProducts.reduce((acc, p, index) => {
        if (products[index]) {
          acc.push({ ...p, productId: products[index] })
        }
        return acc;
      }, []);
    });
}
export const removeFromCart = (user, productId) => {
  return getUserBySearchParam({ email: user.email })
    .then((userInfo) => {
      const cart = JSON.parse(userInfo.cart || '{"items":[]}');
      const updatedCartItems = cart.items.filter((i) => i.productId.toString() !== productId.toString());
      cart.items = updatedCartItems;
      const stmt = db.prepare('UPDATE Users SET cart = ? WHERE email = ?');

      stmt.run(JSON.stringify(cart), user.email);
      return true;
    });
};
export const clearCart = (user) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare('UPDATE Users SET cart = ? WHERE email = ?');
      stmt.run(JSON.stringify({ "items": [] }), user.email);
      resolve(true);
    } catch (dbError) {
      console.error(dbError);
      reject(dbError);
    }
  });
};
const createAddress = (shipmentAddress) => {
  return new Promise((resolve, reject) => {
    try {
      const userId = shipmentAddress.userId;
      delete shipmentAddress.userId;
      const stmt = db.prepare('INSERT INTO ShipmentAddresses (id, userId, address) VALUES (?, ?, ?)');
      stmt.run(uuid(), userId, JSON.stringify(shipmentAddress));
      resolve(true);
    } catch (err) {
      console.log('Failed to create shipment address', err);
      reject(err)
    }
  });
};
const updateAddress = (shipmentAddress) => {
  return new Promise((resolve, reject) => {
    try {
      const userId = shipmentAddress.userId;
      delete shipmentAddress.userId;
      delete shipmentAddress.id;
      const stmt = db.prepare('UPDATE ShipmentAddresses SET address = ? WHERE userId = ?');
      stmt.run(JSON.stringify(shipmentAddress), userId);
      resolve(true);
    } catch (err) {
      console.log('Failed to update shipment address', err);
      reject(err)
    }
  });
};
export const getAddressByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`SELECT * from ShipmentAddresses WHERE userId = ?`);
      const value = stmt.get(userId);
      let shipmentAddress = { ...(value || {}) };
      
      if (shipmentAddress.id) {
        shipmentAddress = Object.assign({}, shipmentAddress, JSON.parse(shipmentAddress.address))
      }
      resolve(shipmentAddress);
    } catch (err) {
      console.log('Failed to get shipment address', err);
      reject(err)
    }
  });
};
export const addOrUpdateAddress = (shipmentAddress) => {
  return getAddressByUserId(shipmentAddress.userId)
  .then((savedAddress) => {
    return savedAddress.id ? updateAddress(shipmentAddress) : createAddress(shipmentAddress);
  });
}

/*    JavaScript
    Unit tests:
    1. Test if initialize function creates tables in the database correctly.
    2. Test if addProduct function adds a new product to the database.
    3. Test if getProductById function retrieves the correct product by its ID.
    4. Test if updateProduct function updates the details of a product correctly.
    5. Test if getProducts function returns the correct list of products based on pagination parameters.
*/

export default {
  initialize,
  addProduct,
  getProductById,
  updateProduct,
  getProducts,
  deleteProduct,
  removeProductFromCart,
  getUserBySearchParam,
  validateLogin,
  signup,
}