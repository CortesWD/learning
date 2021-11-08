/*
 * Dependencies
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

/*
 * Routes
 */
const feedRoutes = require('./routes/feed');

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
  next();
});

app.use('/feed', feedRoutes);

/**
 *  Error middleware to handle errors
 * when next(error) its called
 */
app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode = 500, message } = error;
  res.status(statusCode).json({ message });
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(8080, (err) => {
      if (err) throw new Error(err)
      console.log('server up');
    });
  })
  .catch(err => console.log(err));
