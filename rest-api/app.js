/*
 * Dependencies
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

/*
 * Routes
 */
const feedRoutes = require('./routes/feed');

const MONGODB_URI = 'mongodb://localhost:27017/messages';

const app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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
