import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import db from '../database/sqlite.js';
import fs from '../util/file.js';

export function addProduct (product) {
  const fileExtension = extname(product.image.originalname);
  const key = `${uuid()}${fileExtension}`;
  return fs.uploadFile(key, product.image).then(() => {
      product.imageUrl = `/${key}`;
      product.imageKey = key;
      delete product.image;
      return db.addProduct(product);
    })
}

export function getProduct (productId) {
  return db.getProductById(productId)
}

export async function updateProduct (product) {
  if (product.image) {
    const fileExtension = extname(product.image.originalname);
    const key = `${uuid()}${fileExtension}`;
    await fs.uploadFile(key, product.image)

    product.imageUrl = `/${key}`;
    product.imageKey = key;
    delete product.image;
  }
  return await db.updateProduct(product);
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
  const fileExtension = extname(file.originalname)
  const key = `${uuid()}${fileExtension}`
  return fs.uploadFile(key, file).then(() => ({
      uploaded: true,
      url: `/${key}`,
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
