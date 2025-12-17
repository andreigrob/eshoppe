import dotenv from 'dotenv'
dotenv.config({ path: './w3s-dynamic-storage/.env' })
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import moment from 'moment'
import Sql from 'better-sqlite3'
import { resolve as _resolve } from 'path'

/** @type {string} */
const dbPath = process.env.SQLITE_DB
if (!dbPath) {
  throw new Error('Missing env SQLITE_DB')
}

const db = new Sql(_resolve(dbPath), { fileMustExist: false })

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

function reject (r, e, m, err) {
  if (err) {
    console.error(m, e)
  } else {
    console.log(m, e)
  }
  if (!r) {
    throw e
  }
  return r(e)
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
      reject(null, e, 'Failed to update product')
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
      reject(r, e, 'Error getting user by search parameter', true)
    }
  })
}

export function validateLogin (email, password) {
  let user
  return getUserBySearchParam({ email }).then((userInfo) => {
      user = userInfo
      return user ? bcrypt.compare(password, user.password) : false
    }).then((match) => ({ match, user })).catch((e) => {
      reject(null, e, 'Failed to validate login')
    })
}
const signupSql = db.prepare('insert into Users (id, email, password, role) values (?, ?, ?, ?)');
export function signup (user) {
  return bcrypt.hash(user.password, 12).then((password) => {
      signupSql.run(uuid(), user.email, password, user.role || '')
      return true
    }).catch((e) => {
      reject(null, e, 'Failed to signup')
    })
}

const addAdminUser = signup
/*
const addAdminSql = db.prepare('insert into Users (id, email, password, role) values (?, ?, ?, ?)')
function addAdminUser (user) {
  return bcrypt.hash(user.password, 12).then((hashedPassword) => {
      addAdminSql.run(uuid(), user.email, hashedPassword, user.role || '')
      return true
    }).catch((e) => {
      reject(null, e, 'Failed to add admin user')
    })
}
*/

const updateTokenSql = db.prepare('update Users set resetToken = ? where email = ?')
export function attachResetPasswordToken (email, token) {
  return getUserBySearchParam({ email }).then((user) => {
      if (!user) {
        throw new Error('No account with the provided email address exists.')
      }
      updateTokenSql.run(token, email)
      return true
    }).catch((e) => {
      reject(null, e, 'Failed to attach reset password token')
    })
}

const resetPasswordSql = db.prepare('update Users set password = ?, resetToken = ? where id = ?')
export function resetPassword (userId, password, resetToken) {
  return getUserBySearchParam({ id: userId, resetToken }).then(() => {
      return bcrypt.hash(password, 12);
    }).then((hashedPassword) => {
      resetPasswordSql.run(hashedPassword, '', userId)
      return true
    }).catch((e) => {
      reject(null, e, 'Failed to reset password')
    })
}

const deleteAdminSql = db.prepare('delete from Users where email = ? and role = ?')
function deleteAdminUser (userEmail) {
  return new Promise((resolve, r) => {
    try {
      deleteAdminSql.run(userEmail, 'admin')
      resolve(true)
    } catch (e) {
      reject(r, e, 'Failed to delete admin user')
    }
  })
}

const createOrderSql = db.prepare('insert into Orders (id, userId, email, date, products) values (?, ?, ?, ?, ?)')
function createOrder (user, products) {
  return new Promise((resolve, r) => {
    try {
      const orderId = uuid()
      const date = moment().format('YYYY-MM-DD')
      createOrderSql.run(orderId, user.id, user.email, date, JSON.stringify(products))
      resolve(true)
    } catch (e) {
      reject(r, e, 'Failed to create order')
    }
  })
}

const getOrdersSql = db.prepare('select * from Orders where userId = ?')
export function getOrders (userId) {
  return new Promise((resolve, r) => {
    try {
      const orders = getOrdersSql.all(userId)
      orders.forEach((o) => {
        o.user = {email: o.email, userId: o.userId,}
        o.products = JSON.parse(o.products)
      })
      resolve(orders)
    } catch (e) {
      reject(r, e, 'Error getting order for user ' + userId, true)
    }
  })
}

const noItems = '{"items":[]}'
const addItemSql = db.prepare('UPDATE Users SET cart = ? WHERE email = ?')
export function addToCart (user, product) {
  return getUserBySearchParam({email: user.email}).then((userInfo) => {
      const cart = JSON.parse(userInfo.cart || noItems)
      const cartProductIndex = cart.items.findIndex((cp) => cp.productId.toString() === product.id.toString())
      const updatedCartItems = [...cart.items]
      if (cartProductIndex >= 0) {
        updatedCartItems[cartProductIndex].quantity = cart.items[cartProductIndex].quantity + 1
      } else {
        updatedCartItems.push({productId: product.id, quantity: 1,})
      }
      const updatedCart = {items: updatedCartItems,} 
      addItemSql.run(JSON.stringify(updatedCart), user.email)
      return true
    })
}

export function getCart (user) {
  let cartProducts;
  return getUserBySearchParam({email: user.email,}).then((userInfo) => {
      const cart = JSON.parse(userInfo.cart || noItems)
      cartProducts = cart.items
      return Promise.all(cartProducts.map((item) => getProductById(item.productId)))
    }).then((products) => {
      return cartProducts.reduce((acc, p, index) => {
        if (products[index]) {
          acc.push({...p, productId: products[index],})
        }
        return acc
      }, [])
    })
}

const removeItemSql = db.prepare('update Users set cart = ? where email = ?')
export function removeFromCart (user, productId) {
  return getUserBySearchParam({email: user.email,}).then((userInfo) => {
      const cart = JSON.parse(userInfo.cart || noItems)
      cart.items = cart.items.filter((i) => i.productId.toString() !== productId.toString())
      removeItemSql.run(JSON.stringify(cart), user.email)
      return true
    })
}

const noItemsStr = JSON.stringify(noItems)
const clearItemsSql = db.prepare(`update Users set cart = '${noItemsStr}' where email = ?`)
export function clearCart (user) {
  return new Promise((resolve, r) => {
    try {
      clearItemsSql.run(user.email)
      resolve(true)
    } catch (e) {
      reject(r, e, 'Error clearing cart', true)
    }
  })
}

const createAddressSql = db.prepare('insert into ShipmentAddresses (id, userId, address) values (?, ?, ?)')
export function createAddress (shipmentAddress) {
  return new Promise((resolve, r) => {
    try {
      const userId = shipmentAddress.userId
      delete shipmentAddress.userId    
      createAddressSql.run(uuid(), userId, JSON.stringify(shipmentAddress))
      resolve(true)
    } catch (e) {
      reject(r, e, 'Failed to create shipment address', true)
    }
  })
}

const updateAddressSql = db.prepare('update ShipmentAddresses set address = ? where userId = ?')
export function updateAddress (shipmentAddress) {
  return new Promise((resolve, r) => {
    try {
      const userId = shipmentAddress.userId
      delete shipmentAddress.userId
      delete shipmentAddress.id
      updateAddressSql.run(JSON.stringify(shipmentAddress), userId)
      resolve(true)
    } catch (e) {
      reject(r, e, 'Failed to update shipment address')
    }
  })
}

const getAddressSql = db.prepare('select * from ShipmentAddresses where userId = ?')
export function getAddressByUserId (userId) {
  return new Promise((resolve, r) => {
    try {
      const value = getAddressSql.get(userId)
      let shipmentAddress = { ...(value || {}) }
      if (shipmentAddress.id) {
        shipmentAddress = Object.assign({}, shipmentAddress, JSON.parse(shipmentAddress.address))
      }
      resolve(shipmentAddress)
    } catch (e) {
      reject(r, e, 'Failed to get shipment address');
    }
  })
}

export function addOrUpdateAddress (shipmentAddress) {
  return getAddressByUserId(shipmentAddress.userId).then((savedAddress) => {
    return savedAddress.id ? updateAddress(shipmentAddress) : createAddress(shipmentAddress)
  })
}

export default {
  initialize,
  addProduct,
  getProductById,
  createOrder,
  updateProduct,
  getProducts,
  deleteProduct,
  removeProductFromCart,
  getUserBySearchParam,
  validateLogin,
  signup,
  addAdminUser,
  deleteAdminUser,
}