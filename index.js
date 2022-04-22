const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const path = require('path')
const authRoutes = require('./routes/authRoutes')
const todoRoutes = require('./routes/receipt')
require('dotenv').config()
var session = require('express-session');
var passport = require('passport');

const PORT = process.env.PORT || 5000

const app = express()
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.jwt_secret,
    saveUninitialized:true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.locals.user = req.user || null;
    next();
})

app.use(todoRoutes)
app.use(authRoutes)
async function start() {
    try {
        await mongoose.connect(process.env.DBUri ||'mongodb+srv://bcmplanetsociety:bcmplanetsociety@bcm.klhw7.mongodb.net/bcmPlanet?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex:true,
        })
        app.listen(PORT, () => {
            console.log('Server has been started...at http://localhost:5000')
        })

    } catch (e) {
        console.log(e)
    }
}


start()
