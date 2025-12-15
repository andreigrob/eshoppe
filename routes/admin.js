import { Router } from 'express';
import { body } from 'express-validator';
import ct from '../controllers/admin.js';
import fileContent from '../middleware/fileContent.js';
import isAdminUser from '../middleware/isAdminUser.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const adminRouter = Router();

const productValidation = [
  body('title').trim().isString().isLength({ min: 1, max: 250 }).withMessage('Title must be 1 to 250 characters in length.'),
  body('price').isFloat(),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1 to 500 characters in length.'),
]

adminRouter.use(isAuthenticated);
adminRouter.use(isAdminUser);
adminRouter.get('/add-product', ct.getAddProduct);
adminRouter.get('/products', ct.getProducts);
adminRouter.post('/add-product', fileContent.single('image'), productValidation, ct.postAddProduct);
adminRouter.get('/edit-product/:productId', ct.getEditProduct);
adminRouter.post('/edit-product', fileContent.single('image'), productValidation, ct.postEditProduct);
adminRouter.delete('/product/:productId', ct.deleteProduct);
adminRouter.post('/upload-image', fileContent.single('upload'), ct.uploadImage);

export default adminRouter;