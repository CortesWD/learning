/*
 * Dependencies
 */
const express = require('express');
const bodyParser = require('body-parser');

/*
 * Routes
 */
const feedRoutes = require('./routes/feed');

const app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
 * Adding headers for all request
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Header', 'Content-Type, Authorization');
  next();
})

app.use('/feed', feedRoutes);


app.listen(8080, (err) => {
  if (err) throw new Error(err);
  console.log('Server up')
});
