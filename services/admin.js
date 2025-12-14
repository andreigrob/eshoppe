import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { addProduct as _addProduct, getProductById, updateProduct as _updateProduct, getProducts as _getProducts, removeProductFromCart, deleteProduct as _deleteProduct } from '../database/sqlite.js';
import { uploadFile as _uploadFile, deleteFile } from '../util/file.js';

export const addProduct = (product) => {
  const fileExtension = extname(product.image.originalname);
  const key = `${uuid()}${fileExtension}`;
  
  return _uploadFile(key, product.image)
    .then(() => {
      product.imageUrl = `/${key}`;
      product.imageKey = key;
      delete product.image;
      return _addProduct(product);
    })
};
export const getProduct = (productId) => getProductById(productId);
export const updateProduct = async (product) => {
  if (product.image) {
    const fileExtension = extname(product.image.originalname);
    const key = `${uuid()}${fileExtension}`;
    await _uploadFile(key, product.image)

    product.imageUrl = `/${key}`;
    product.imageKey = key;
    delete product.image;
  }

  return await _updateProduct(product);
};
export const getProducts = (page, limit, userId) => _getProducts(page, limit, userId);
export const deleteProduct = (productId) => {
  let product;
  return getProductById(productId)
    .then((p) => {
      product = p;
      if (product) {
        return removeProductFromCart(productId)
      }
      throw new Error('product not found');
    })
    .then(() => deleteFile(product.imageKey))
    .then(() => _deleteProduct(productId))
    .catch(() => false);
};
export const uploadFile = (file) => {
  const fileExtension = extname(file.originalname);
  const key = `${uuid()}${fileExtension}`;
  
  return _uploadFile(key, file)
    .then(() => ({
      uploaded: true,
      url: `/${key}`,
      key,
    }));
};

export default {
  addProduct,
  getProduct,
  updateProduct,
  getProducts,
  deleteProduct,
  uploadFile,
};
