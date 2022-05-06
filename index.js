const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const receiptRoutes = require("./routes/receipt");
const eventRoutes = require("./routes/event");
const indexRoute = require("./routes/index");
//const testRoute = require("./routes/test");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const expressLayouts = require("express-ejs-layouts");
const flash = require('connect-flash');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(expressLayouts);
//setting template engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set 'views' directory for any views
// being rendered res.render()
app.set("views", path.join(__dirname, "views"));
app.set("layout", "./layouts/main");

app.use(
  session({
    secret: process.env.jwt_secret,
    saveUninitialized: true,
    resave: true,
    rolling: true, // forces resetting of max age
    cookie: { maxAge: 60 * 60 * 1000, secure: false }, // 1 hour
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
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
