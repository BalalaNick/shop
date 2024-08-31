const User = require('../model/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport({
    service:"gmail", 
    secure:true,
    port: 465,
    auth: {
      user: 'nodejsemail41@gmail.com',
      pass: 'etxojqtnwlbjzqlg'
    },
  });

exports.getLogin = (req,res,next) => {
    let message = req.flash('error');
    if( message.length > 0 ) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login.ejs',{
        pagetitle:'THIS IS LOGIN PAGE',
        ereMessage: message,
        oldInput:{
            email:'',
            password:''
        },
        validationErrors: []
    })
}


exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;

    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error.array());
        res.status(422).render('auth/login.ejs',{
            pagetitle:'THIS IS Login PAGE',
            ereMessage:error.array()[0].msg,
            oldInput:{
                email:email,
                password:password
            },
            validationErrors:error.array()
        })
    }

    User.findOne({ email:email })
    .then(user => {
        if(!user){
            req.flash('error','Invalid email or password');
            return res.redirect('/login');
        }
        return bcrypt
        .compare(password,user.password)
        .then(doMatch => {
            if(doMatch){
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect('/');
                })
            }
            req.flash('error','Invalid email or password');
            res.redirect('/login')
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.postLogout = (req,res,next) => { 
    req.session.destroy(err =>{
        console.log(err);
        res.redirect('/');
    })
}

exports.getSignup = (req,res,next) => {
    let message = req.flash('error');
    if( message.length > 0 ) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup.ejs',{
        pagetitle:'THIS IS Signup PAGE',
        ereMessage: message,
        oldInput:{
            email:"",
            password:"",
            Conpassword:""
        },
        validationErrors: []
    })
}


exports.postSignup = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;

    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error.array());
        res.status(422).render('auth/signup.ejs',{
            pagetitle:'THIS IS Signup PAGE',
            ereMessage:error.array()[0].msg,
            oldInput:{
                email:email,
                password:password,
                Conpassword:req.body.Conpassword
            },
            validationErrors:error.array()
        })
    }

    User.findOne({email:email})
    .then(userdoc =>{
        if(userdoc){
            return res.redirect('/login');
        }
        return bcrypt
        .hash(password,12)
        .then(hashpassword => {
            const user = new User({
                email:email,
                password:hashpassword,
                cart:{ item:[] }
            })
            return user.save();
        })
        .then(result => {
          res.redirect('/login');
           return transporter.sendMail({
                to: email, 
                from: "nodejsemail41@gmail.com",
                subject: "Shop SignUp", 
                html: `
                <h1>Welcome To Rolex World</h1>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkqvYiiEPpx2cR39QjJIh2m1-xQ6L_P5uNKw&usqp=CAU" >`
              })
              .catch(err => {
                console.log(err);
              })
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.getResetpassword = (req,res,next) => {
    let message = req.flash('error');
    if( message.length > 0 ) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset',{
        pagetitle:'THIS IS RESET PASSWORD PAGE',
        ereMessage: message
    })
}

exports.postResetPassword = (req,res,next) => {
    crypto.randomBytes(32,(err,Buffer)=>{
        if(err){
            res.redirect('/reset');
            console.log(err);
        }

    const token = Buffer.toString('hex');
    
    User.findOne({email:req.body.email})
    .then(user => {
        if(!user){
            req.flash('error','Email Account does not exits');
            return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpressiondate = Date.now() + 3600000;
        return user.save();
    })
    .then(result =>{
        res.redirect('/shop');
           return transporter.sendMail({
                to: req.body.email, 
                from: "nodejsemail41@gmail.com",
                subject: "Reset Password", 
                html: `
                <h1>Rolex World Login Reset Password</h1>
                <h4>Your requset for password Resetting</h4>
                <a href="http://localhost:5000/reset/${token}">Link</a>To set New Password
                `
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
});
}

exports.getnewpassword = (req,res,next) => {
    const token = req.params.token;
    User.findOne({resetToken:token,resetTokenExpressiondate:{$gt:Date.now()}})
    .then(user => {
        let message = req.flash('error');
    if( message.length > 0 ) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/new-password',{
        pagetitle:'THIS IS Update PASSWORD PAGE',
        ereMessage: message,
        userId:user._id.toString(),
        passwordToken:token
    })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.postnewpassword = (req,res,next) => {
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    const newpassword = req.body.newpassword;
    let resetUser;

    User.findOne({resetToken:passwordToken,resetTokenExpressiondate:{ $gt:Date.now() },_id:userId})
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newpassword,12);
    })
    .then(hashpassword => {
        resetUser.password = hashpassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpressiondate = undefined;
        return resetUser.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}