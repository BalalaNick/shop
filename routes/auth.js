const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');
const { check,body } = require('express-validator');
const User = require('../model/User');

//get Login
router.get('/login',authController.getLogin);

//post Login
router.post('/login',[
    body('email')
    .isEmail()
    .withMessage(
        'Please Enter a Valid Email'),
    body(
        'password',
        'Please Enter a Password With only number and text atlest 5 charchter'
    )
    .isLength({ min : 5 })
    .isAlphanumeric(),],authController.postLogin);

//post Logout
router.post('/logout',authController.postLogout);

//get Signup
router.get('/signup',authController.getSignup);

//post SignUp
router.post('/signup',[
    check('email')
    .isEmail()
    .withMessage(
    'Please Enter a Valid Email')
    .custom((value,{ req })=>{
       return User.findOne({ email:value }).then(userdoc => {
            if(userdoc){
                return Promise.reject(
                    'Enter Email Already Exits , Picup Diffrent One'
                )
            }
        })
    }),
    body(
        'password',
        'Please Enter a Password With only number and text atlest 5 charchter'
    )
    .isLength({ min : 5 })
    .isAlphanumeric(),
   body('Conpassword')
   .custom((value,{ req }) => {
    if(value !== req.body.password){
        throw new Error('password have to Match!');
    }
    return true;
   })
   ],authController.postSignup);

//get Reset Password
router.get('/reset',authController.getResetpassword);

//post Reset password
router.post('/reset',authController.postResetPassword);

//get Reset password
router.get('/reset/:token',authController.getnewpassword);

//post Reset password
router.post('/new-password',authController.postnewpassword);

module.exports = router;