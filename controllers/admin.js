import { validationResult } from 'express-validator'
import { catchFunc, getInt1 } from './common.js'
import admin from '../services/admin.js'

const empty = []

const getAddProductModel = {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: empty,
  }
function getAddProduct (_req, res, _next) {
  return res.render('admin/add-edit-form', getAddProductModel)
}

function postAddProduct (req, res, next) {
  const p = req.body
  const product = {title: p.title, price: p.price, description: p.description, details: p.details, image: req.file, userId: req.user.id,}
  function errorRes (errorMessage, validationErrors) {
    return res.status(422).render('admin/add-edit-form', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product,
      errorMessage,
      validationErrors,
    })
  }
  if (!product.image) {
    return errorRes('File type not supported. Please upload a JPEG, JPG, or PNG image file.', empty)
  }
  const errors = validationResult(req)
  if (errors && !errors.isEmpty()) {
    return errorRes(errors.array()[0].msg, errors.array())
  }
  admin.addProduct(product).then(() => {
      res.redirect('/admin/products')
    }).catch(catchFunc(next))
}

function getEditProduct (req, res, next) {
  const editMode = req.query.edit
  if (!editMode) {
    return res.redirect('/')
  }
  admin.getProduct(req.params.productId).then((product) => {
      if (!product) {
        return res.redirect('/')
      }
      return res.render('admin/add-edit-form', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product,
        hasError: false,
        errorMessage: null,
        validationErrors: empty,
      })
    }).catch(catchFunc(next))
}

function postEditProduct (req, res, next) {
  const p = req.body
  const product = {id: p.productId, productId: p.productId, title: p.title, price: p.price, description: p.description, details: p.details, image: req.file, userId: req.user.id,}
  const errors = validationResult(req)
  if (errors && !errors.isEmpty()) {
    return res.status(422).render('admin/add-edit-form', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    })
  }
  admin.updateProduct(product).then((status) => {
      return res.redirect(status ? '/admin/products' : '/')
    }).catch(catchFunc(next))
}

const productLimit = 8
function getProducts (req, res, next) {
  const page = getInt1(req.query.page)
  return admin.getProducts(page, productLimit, req.user.id).then((args) => {
      res.render('admin/products', {
        prods: args.products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        hasNextPage: productLimit * page < args.count,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(args.count / productLimit),
      })
    }).catch(catchFunc(next))
}

function deleteProduct (req, res, _next) {
  return admin.deleteProduct(req.params.productId).then(() => {
      return res.status(200).json({message: 'Success!',})
    }).catch((e) => {
      return res.status(500).json({message: 'Deleting product failed: ' + e,})
    })
}

function uploadImage (req, res, _next) {
  if (!req.file) {
    return res.status(400).json({uploaded: false, error: {message: 'File content not found',},})
  }
  return admin.uploadFile(req.file).then((data) => {
      return res.status(200).json(data);
    })
}

export default {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  getProducts,
  deleteProduct,
  uploadImage,
}