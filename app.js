const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const mongoDBstore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const https = require('https');

const User = require('./model/User');
const errorController = require('./controller/error');
const admin = require('./routes/admin');
const shop = require('./routes/shop');
const auth = require('./routes/auth');


const MongoDB_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@product.owbokbk.mongodb.net/${process.env.MONGO_DEFULT_DATABSE}`;

const app = express();

const store = new mongoDBstore({
    uri:MongoDB_URL,
    collection:'sessions'
})

const csrfProtection = csrf();

const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().getTime() + '-' + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
app.set('view engine','ejs');
app.set('views','views');

app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname,'images')));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname,'access.log'),
  { flags:'a' }
)

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "defaultSrc": ["'self'", "https://js.stripe.com/v3/"],
      "script-src": ["'self'", "https://js.stripe.com/v3/"]
    },
  })
);
app.use(compression());
app.use(morgan('combined',{ stream: accessLogStream }));

app.use(bodyParser.urlencoded({extended: false}));
app.use(
    session({
        secret:'i am Yash', 
        resave:false ,
        saveUninitialized: false,
        store:store
    })
)

app.use(csrfProtection);
app.use(flash());

app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user
        next();
    })
    .catch(err => {
       next(new Error(err));
    })
})


app.use((req,res,next) => {
    res.locals.isAuthntication = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin',admin.routs);
app.use(shop);
app.use(auth);

app.get('/500',errorController.get500error);

app.use(errorController.get404error);

app.use((error, req, res, next) => {
    res.status(500).render('error/500', {
      pagetitle: 'Error!',
      isAuthntication:req.session.isLoggedIn
    });
});
  

mongoose.connect(MongoDB_URL)
.then(result => {
  // https.createServer({ key:privateKey, cert:certificate },app)
  //  .listen(process.env.PORT || 5000)
  app.listen(process.env.PORT || 5000)
   console.log('Connected!');
})
.catch(err => {
    console.log(err)
})
