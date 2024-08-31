const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin')
const auth = require('../middlwere/is-auth');
const { body } = require('express-validator')

//Get Add-Products
router.get('/add-product',auth,adminController.getAddproduct);

//Get Product
router.get('/products',auth,adminController.getProducts);

//post Add-Product
router.post('/add-product',
    [
        body('title')
          .isString()
          .isLength({ min: 3 })
          .trim(),
        body('price').isFloat(),
        body('description')
        .isString()
          .isLength({ min: 5 })
          .trim()
    ],auth,adminController.postAddProduct);

//post Edit-product
router.get('/edit-product/:productID',auth,adminController.getEditproducr);

//post Edit-product
router.post('/edit-product',
    [
        body('title')
          .isString()
          .isLength({ min: 3 })
          .trim(),
        body('price').isFloat(),
        body('description')
        .isString()
          .isLength({ min: 5 })
          .trim()
    ],auth,adminController.postEditproduct);

//post delete Product
router.post('/delete-product',auth,adminController.postDeleteproduct);

exports.routs = router;