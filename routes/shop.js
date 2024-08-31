const express = require('express');
const router = express.Router();
const shopController = require('../controller/shop');
const auth = require('../middlwere/is-auth');

//get shop
router.get('/',shopController.getShop);

//get Products
router.get('/products',shopController.getProducts);

//get Product details
router.get('/products/:productID',shopController.getProductDetails);

//get Cart
router.get('/cart',auth,shopController.getCrat);

//post Cart
router.post('/cart',auth, shopController.postCart);

//get Order
router.get('/order',auth,shopController.getOrder);

//get checkout
router.get('/checkout',auth,shopController.getCheckout);

//get checkout
router.get('/checkout/success',auth,shopController.getCheckoutsuccess);

//get checkout
router.get('/checkout/cancel',auth,shopController.getCheckout);

//post cart delete
router.post('/cart-delete-item',auth,shopController.postCartDelete)

//get orderinvocie
router.get('/order-invoice/:orderId',auth,shopController.getInvoice);

module.exports = router;