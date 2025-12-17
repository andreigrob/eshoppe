import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import db from '../database/sqlite.js';
import fs from '../util/file.js';

function Key (product) {
  const key = uuid() + extname(product.image.originalname)
  product.imageUrl = '/' + key
  product.imageKey = key
  return key
}

export function addProduct (product) {
  return fs.uploadFile(Key(product), product.image).then(() => {
      delete product.image
      return db.addProduct(product)
    })
}

export function getProduct (productId) {
  return db.getProductById(productId)
}

export async function updateProduct (product) {
  if (product.image) {
    await fs.uploadFile(Key(product), product.image)
    delete product.image
  }
  return await db.updateProduct(product)
}

export function getProducts (page, limit, userId) {
  return db.getProducts(page, limit, userId)
}

export function deleteProduct (productId) {
  let product
  return db.getProductById(productId).then((p) => {
      product = p
      if (product) {
        return removeProductFromCart(productId)
      }
      throw new Error('product not found')
    }).then(() => fs.deleteFile(product.imageKey))
    .then(() => db.deleteProduct(productId))
    .catch(() => false)
}

export function uploadFile (file) {
  const key = uuid() + extname(file.originalname)
  return fs.uploadFile(key, file).then(() => ({
      uploaded: true,
      url: '/' + key,
      key,
    }))
}

export default {
  addProduct,
  getProduct,
  updateProduct,
  getProducts,
  deleteProduct,
  uploadFile,
}
