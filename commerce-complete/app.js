/*
 * Dependencies
 */
const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

/*
 * Models
 */
const User = require('./models/user');

/*
 * Routes
 */
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

/*
 * Controllers
 */
const { get404, get500 } = require('./controllers/errors');
const { catchError } = require('./util/catch-error');

/*
 * Others
 */

const rootDir = require('./util/path');

// const MONGODB_URI = process.env.NODE_ENV === 'production' 
//   ? `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.g1of1.mongodb.net/${process.env.MONGO_DB}`
//   : 'mongodb://localhost:27017/shop';

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.g1of1.mongodb.net/${process.env.MONGO_DB}`;

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

// const privateKey = fs.readFileSync(path.join(rootDir, 'server.key'));
// const certificate = fs.readFileSync(path.join(rootDir, 'server.cert'));

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const { mimetype } = file;
  const types = ['image/png', 'image/jpg', 'image/jpeg'];

  if (types.includes(mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
/* views is the default dir */
app.set('views', 'views');

const accessLogStream = fs.WriteStream(
  path.join(rootDir, 'access.log'),
  { flags: 'a' }
);

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store
}));

app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
  /**
   * Locals is to set vars across all requests
   */
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  const { session } = req;
  const { user } = session;
  if (!user) return next();

  User.findById(user._id)
    .then((user) => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch(err => catchError(err, next));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', get500);
app.use(get404);

/**
 *  Error middleware to handle errors
 * when next(error) its called
 */
app.use((error, req, res, next) => {
  // res.status(500).render('500', {
  //   docTitle: 'Server Error',
  //   path: null,
  // });
  console.log(error);
  res.redirect('/500');
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    //manual set of SSL
    // https.createServer({
    //   key: privateKey,
    //   cert: certificate
    // }, app)
    app.listen(process.env.PORT || 3000, (err) => {
      if (err) throw new Error(err)
      console.log('ready to go');
    });
  })
  .catch(err => console.log(err));