/*
 * Dependencies
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');

/*
 * GraphQL
 */
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

/*
 * Middleware
 */
const auth = require('./middleware/is-auth');

/*
 * Others
 */
const { deleteFile } = require('./util/file');

const MONGODB_URI = 'mongodb://localhost:27017/messages';


const storage = multer.diskStorage({
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


const app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// image at the end is the field name on the request
app.use(multer({ storage, fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

/*
 * Adding headers for all request
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization,');

  /*
   * graphqlHTTP declines any header that is not post or get
   * so this block will allow pass the options request
   */
  if (req.method === 'OPTIONS') return res.sendStatus(200);

  next();
});

app.use(auth);

/*
 *  GraphQL only reads JSON, we need to created endpoints to handle files
 */
app.put('/post-image', (req, res, next) => {
  const { file, body, isAuth } = req;
  const { oldPath } = body;

  if (!isAuth) {
    const error = new Error('not auth');
    error.code = 401;
    throw error;
  }

  if (!file) {
    return res.status(200).json({message: 'no file provided'});
  }

  if (oldPath) deleteFile(oldPath);


  return res
    .status(201)
    .json({
      message: 'file stored',
      filePath: file.path
    })

});

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  customFormatErrorFn(err) {
    if (!err.originalError) return err;

    const {
      message = 'something went wrong',
      originalError: { data = [], code = 500 }
    } = err || {};

    return {
      data,
      message,
      status: code
    };
  }
}));

/**
 *  Error middleware to handle errors
 * when next(error) its called
 */
app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode = 500, message, data } = error;
  res.status(statusCode).json({ message, data });
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(8080, (err) => {
      if (err) throw new Error(err)
      console.log('server up');
    });
  })
  .catch(err => console.log(err));
