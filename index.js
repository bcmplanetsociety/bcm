const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const expressLayouts = require("express-ejs-layouts");
const flash = require('connect-flash');
const cors = require('cors');
const fs = require('fs');

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

//Empty otp folder files after 24 hours.
setInterval(function() {
  walkDir('./helpers/otp/', function(filePath) {
  fs.stat(filePath, function(err, stat) {
  var now = new Date().getTime();
  var endTime = new Date(stat.mtime).getTime() + 86400000; // 1days in miliseconds

  if (err) { return console.error(err); }

  if (now > endTime) {
      //console.log('DEL:', filePath);
    return fs.unlink(filePath, function(err) {
      if (err) return console.error(err);
    });
  }
})  
});
}, 18000000); // run script every 5 hours

function walkDir(dir, callback) {
fs.readdirSync(dir).forEach( f => {
  let dirPath = path.join(dir, f);
  let isDirectory = fs.statSync(dirPath).isDirectory();
  isDirectory ? 
    walkDir(dirPath, callback) : callback(path.join(dir, f));
});
};

//Express Session
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

//routes
const authRoutes = require("./routes/authRoutes");
const receiptRoutes = require("./routes/receipt");
const eventRoutes = require("./routes/event");
const indexRoute = require("./routes/index");
const helpRoute = require("./routes/helping");
const userRelated = require("./routes/userRelated");
//const testRoute = require("./routes/test");
app.use(receiptRoutes);
app.use(authRoutes);
app.use(eventRoutes);
app.use(indexRoute);
app.use(helpRoute);
app.use(userRelated);
//app.use(testRoute);

app.get('/error', async (req, res) => {
  res.render('error');

});
 // error handler
 app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.error(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
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
