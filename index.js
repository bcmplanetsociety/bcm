const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const receiptRoutes = require("./routes/receipt");
const eventRoutes = require("./routes/event");
const indexRoute = require("./routes/index");
//const testRoute = require("./routes/test");
require("dotenv").config();
//const session = require("cookie-session");
const session = require("express-session");
const passport = require("passport");
const expressLayouts = require("express-ejs-layouts");
const flash = require('connect-flash');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const app = express();


app.use(expressLayouts);
//setting template engine
app.set("view engine", "ejs");
app.use(cors());
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set 'views' directory for any views
// being rendered res.render()
app.set("views", path.join(__dirname, "views"));
app.set("layout", "./layouts/main");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: true,
}));


// app.use(session({
//   secret: process.env.jwt_secret,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { maxAge: 86400000, secure: true  },
// }))
app.use(session({
  secret: process.env.jwt_secret,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next){
  res.locals.message = req.flash();
  next();
});

app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});
app.use(receiptRoutes);
app.use(authRoutes);
app.use(eventRoutes);
app.use(indexRoute);
//app.use(testRoute);

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err);
});

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

async function start() {
  try {
    await mongoose.connect(
      process.env.DBUri,
      {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );
    app.listen(PORT, () => {
      console.log("Server has been started...at http://localhost:5000");
    });
  } catch (e) {
    console.log(e);
  }
}

start();
