const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Product = require('../model/productdata');
const Order = require('../model/order');
const stripe = require('stripe')('sk_test_51PYl1V2LKtzuwR7py5pQ66hwWPDZNCJde9zUzCfAYMw1PDIMWDBAHKXBG7sUUvg9ODuaP7VSD5sXS2VRqDVDGL8400GXcRdsGX');

const ITEM_PER_PAGE = 3;

exports.getShop = (req,res,next) => {
    const page = +req.query.page || 1;
    let totalitems;
    Product.find()
    .countDocuments()
    .then(numProduct => {
        totalitems = numProduct;
        console.log(totalitems)
        return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
    })
    .then(Products => {
        console.log(Products)
        res.render('Shop/index',{
            prods:Products,
            pagetitle:'THIS IS OVER SHOP INDEX PAGE',
            currentpage:page,
            totalnumitems:totalitems,
            hasNextpage:ITEM_PER_PAGE * page < totalitems,
            hasPrepage:page > 1,
            Nextpage:page + 1,
            Prepage:page - 1,
            Lastpage: Math.ceil(totalitems / ITEM_PER_PAGE)
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.getProducts = (req,res,next) => {
    const page = +req.query.page || 1;
    let totalitems;
    Product.find()
    .countDocuments()
    .then(numProduct => {
        totalitems = numProduct;
        console.log(totalitems)
        return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
    })
    .then(Products => {
        console.log(Products)
        res.render('Shop/product-list',{
            prods:Products,
            pagetitle:'THIS IS OVER SHOP PRODUCT PAGE',
            currentpage:page,
            totalnumitems:totalitems,
            hasNextpage:ITEM_PER_PAGE * page < totalitems,
            hasPrepage:page > 1,
            Nextpage:page + 1,
            Prepage:page - 1,
            Lastpage: Math.ceil(totalitems / ITEM_PER_PAGE)
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.getProductDetails = (req,res,next) => {
    const prodId = req.params.productID;
    Product.findById(prodId)
    .then(Products => {
        res.render('Shop/product-detail.ejs',{
            product:Products,
            pagetitle:'THIS IS PRODUCT DETAILS PAGE',
        })
    })
}


exports.getCrat = (req,res,next) => {
    req.user
    .populate('cart.items.productId')
    // .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('Shop/cart.ejs', {
        pagetitle: 'THIS IS SHOP CART',
        products: products,
      });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productID;
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        console.log(result);
        res.redirect('/cart')
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.getOrder = (req,res,next) => {
    Order.find({ 'user.userId' : req.user._id })
    .then(orders => {
        console.log(orders);
        res.render('Shop/order.ejs',{ 
            pagetitle:'THIS IS OVER ORDER PAGE',
            orders:orders,
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.postCartOrder = (req,res,next) => {
    req.user
    .populate('cart.items.productId')
    // .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity:i.quantity , product: { ...i.productId._doc } }
      })
      const order = new Order({
        user:{
            email: req.user.email,
            userId: req.user
        },
        products:products
      })
      return order.save();
    })
    .then(result => {
        req.user.clearCart()
    })
    .then(result => {
        res.redirect('/order')
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.getCheckout = (req,res,next) => {
    let products;
    let total = 0;
    req.user
    .populate('cart.items.productId')
    .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      })

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map(p => {
            return {
              price_data: {
                currency: 'usd',
                unit_amount: p.productId.price,
                product_data: {
                  name: p.productId.title,
                  images: [p.productId.image],
                  description:p.productId.description
                }
              },
              quantity: p.quantity
            };
          }),
          mode:'payment',
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });
    })
    .then(session => {
      res.render('Shop/checkout', {
        pagetitle: 'THIS IS CHECKOUT PAGE',
        products: products,
        totalsum:total,
        sessionId: session.id
      })
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getCheckoutsuccess = (req,res,next) => {
    req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity:i.quantity , product: { ...i.productId._doc } }
      })
      const order = new Order({
        user:{
            email: req.user.email,
            userId: req.user
        },
        products:products
      })
      return order.save();
    })
    .then(result => {
        req.user.clearCart()
    })
    .then(result => {
        res.redirect('/order')
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.postCartDelete = (req,res,next) => {
    const prodId = req.body.productId;
    req.user
    .removeFromcart(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


exports.getInvoice = (req,res,next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
    .then(order => {
        if(!order){
            return next(new Error('No Order'));
        }

        if(order.user.userId.toString() !== req.user._id.toString()){
            return next(new Error('Unauthorized'))
        }

        const InvoiceName = 'invoice-' + orderId + '.pdf';
        const InvoicePath = path.join('data','invoices',InvoiceName);

        const PDFdoc = new PDFDocument();
        
        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Disposition','inline; filename="'+ InvoiceName +'"');
        
        PDFdoc.pipe(fs.createWriteStream(InvoicePath));
        PDFdoc.pipe(res);
        PDFdoc.fontSize(26).text('Invoice',{
            underline:true,
        })
        PDFdoc.text('-------------------------------')
        let totalPrice = 0;
        order.products.forEach(prod =>{
            totalPrice += prod.quantity * prod.product.price;
            PDFdoc.fontSize(14).text(
                prod.product.title + 
                ' - ' + 
                prod.quantity + 
                ' * ' +
                '$' + 
                prod.product.price  
            )
        })
        PDFdoc.text('-------------------------------');
        PDFdoc.text('Total Amount :$' + totalPrice);
        PDFdoc.end();
        
    })
    .catch(err => {
        return next(err);
    })
    
}

