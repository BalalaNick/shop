const Product = require('../model/productdata');
const { validationResult } = require('express-validator');
const fileHelper = require('../views/util/file');

exports.getAddproduct = (req,res,next) => {
    res.render('admin/edit-product',{
        pagetitle:'this is add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
}


exports.getProducts = (req,res,next)=>{
    Product.find()
    .then(products => {
        res.render('admin/products',{
            prods : products,
            pagetitle : 'this is admin products page',

        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


exports.postAddProduct = (req,res,next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;

    if (!image) {
        return res.status(422).render('admin/edit-product', {
          pageTitle: 'Add Product',
          editing: false,
          hasError: true,
          product: {
            title: title,
            price: price,
            description:description
          },
          errorMessage: 'Attached file is not an image.',
          validationErrors: []
        });
      }

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
          console.log(errors.array());
          return res.status(422).render('admin/edit-product', {
            pagetitle: 'Add Product',
            editing: false,
            hasError: true,
            product: {
              title: title,
              imageUrl: imageurl,
              price: price,
              description:description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
          });
        }
  
    const imageurl = image.path;

    const product = new Product({
        title:title,
        imageurl:imageurl,
        price:price,
        description:description,
        userId:req.user
    })
    product.save()
    .then(result=>{
        console.log('Data are inserted');
        res.redirect('/');
        
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.getEditproducr = (req,res,next)=>{
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/');
    }
    const prodId = req.params.productID;
    Product.findById(prodId)
    .then(product => {
        if(!product){
            return res.redirect('/');
        }
        res.render('admin/edit-product',{
            pagetitle:'this is edit-product',
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.postEditproduct = (req,res,next)=>{
    const prodId = req.body.productID;
    const updatetitle = req.body.title;
    const image = req.file;
    const updateprice = req.body.price;
    const updescription = req.body.description;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
          pagetitle: 'Edit Product',
          editing: true,
          hasError: true,
          product: {
            title: updatetitle,
            price: updateprice,
            description: updescription,
            _id: prodId
          },
          errorMessage: errors.array()[0].msg,
          validationErrors: errors.array()
        });
      }

    Product.findById(prodId)
    .then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
          }
        product.title = updatetitle;
        product.price = updateprice;
        product.description = updescription;
        if (image){
            fileHelper.deleteFile(product.imageurl);
            product.imageurl = image.path;
        }
        return product.save();
    })
    .then(result => {
        console.log('UPDATED PRODUCT');
        res.redirect('/admin/products');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
    res.redirect('/admin/products');
}


exports.postDeleteproduct = (req,res,next) => {
    const prodId = req.body.productID;

    Product.findById(prodId)
    .then(product => {
        if(!product){
            return next(new Error('Product Not Found!'));
        }
        fileHelper.deleteFile(product.imageurl);
        return Product.findByIdAndDelete(prodId)
        .then(() => {
            console.log('DELETE PRODUCT');
            res.redirect('/admin/products');
        }).catch(err =>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
    })
    .catch(err => {
        return next(err)
    })
    
}
