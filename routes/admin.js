import { Router } from 'express';
import { body } from 'express-validator';
import { getAddProduct, getProducts, postAddProduct, getEditProduct, postEditProduct, deleteProduct, uploadImage } from '../controllers/admin.js';

import fileContent from '../middleware/fileContent.js';
import isAdminUser from '../middleware/isAdminUser.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const adminRouter = Router();

const productValidator = [
  body('title')
    .trim()
    .isString()
    .isLength({ min: 1, max: 250 })
    .withMessage('Title must be 1 to 250 characters in length.'),
  body('price').isFloat(),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be 1 to 500 characters in length.'),
];

adminRouter.use(isAuthenticated);
adminRouter.use(isAdminUser);
adminRouter.get('/add-product', getAddProduct);
adminRouter.get('/products', getProducts);
adminRouter.post('/add-product',
  fileContent.single('image'),
  productValidator,
  postAddProduct
);
adminRouter.get('/edit-product/:productId', getEditProduct);
adminRouter.post('/edit-product',
  fileContent.single('image'),
  productValidator,
  postEditProduct
);
adminRouter.delete('/product/:productId', deleteProduct);
adminRouter.post('/upload-image', fileContent.single('upload'), uploadImage);

export default adminRouter;