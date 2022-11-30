const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const indexRouts = require('./routs/indexRouts');
const loginRouts = require('./routs/loginRouts');
const signUpRouts = require('./routs/signUpRouts');
const adminRouts = require('./routs/adminRouts');
require('dotenv').config();

const dbURI = process.env.dbURI

// express app
const app = express();

//dataBase connection
mongoose.connect(dbURI)
  .then(() => {
    app.listen(3007, () => console.log('Listening for request'))
  })
  .catch((err) => {
    console.log(err)
  });

//view engine
app.set('view engine', 'ejs');

//staticFile
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


// session
app.use(session({
  secret: "key",
  cookie: { "key": "secret", maxAge: 86400000 }
}));


//preventer
app.use(function (req, res, next) {
  res.set('cache-control', 'no-cache , no-store,must-revalidate,max-stale=0,post-check=0,pre-checked=0');
  next();
});


app.use(indexRouts);
app.use(loginRouts);
app.use(signUpRouts);
app.use(adminRouts);


// 404 page
app.use((req, res) => {
  console.log('not found !!')
  res.status(404).render('user/404');
});