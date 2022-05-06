const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserProfile = require('../models/Profile');
const User = require('../models/User');
const path = require('path')
const Upload = require("../helpers/upload");
const cloudinary = require("../helpers/cloudinary");
const {
   check,
   validationResult
} = require('express-validator');
const {
   superAdminAuthenticated,
   adminAuthenticated,
   ensureAuthenticated
} = require('../middleware/auth');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com", //replace with your email provider
   port: 587,
   auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
   },
});


router.get('/register', function (req, res) {
   res.render('pages/user/register', {
      message: req.flash('signupMessage')
   });
});

router.get('/login', function (req, res) {
   res.render('pages/user/login', {});
});


router.post('/register',
   [
      check('name', 'The Name must have atleast 3 characters').exists().isLength({
         min: 3
      }),
      check('email', 'The Email must have atleast 3 characters & in valid formate').exists().isLength({
         min: 3
      }).isEmail(),
      check('username', 'The username must have atleast 3 characters').exists().isLength({
         min: 3
      }),

      check('password').trim().notEmpty().withMessage('Password required')
      .isLength({
         min: 5
      }).withMessage('password must be minimum 5 length')
      .matches(/(?=.*?[A-Z])/).withMessage('At least one Uppercase')
      .matches(/(?=.*?[a-z])/).withMessage('At least one Lowercase')
      .matches(/(?=.*?[0-9])/).withMessage('At least one Number')
      .matches(/(?=.*?[#?!@$%^&*-])/).withMessage('At least one special character')
      .not().matches(/^$|\s+/).withMessage('White space not allowed'),
      // confirm password validation 
      check('password2').custom((value, {
         req
      }) => {
         if (value !== req.body.password) {
            throw new Error('Password Confirmation does not match password');
         }
         return true;
      })
   ],
   function (req, res) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            res.render('pages/user/register', {
               alert
            })
         }
         else{
         var name = req.body.name;
         var email = req.body.email;
         var username = req.body.username;
         var password = req.body.password;
         var password2 = req.body.password2;
         var role = req.body.role;

         {
            User.findOne({
               email: email,
               username: username
            }).then(function (currentUser) {
               if (currentUser) {
                  console.log('user is already registered:', currentUser);
                  res.redirect('/register')

               } else {
                  var newUser = new User({
                     name: name,
                     email: email,
                     username: username,
                     password: password,
                     role: role
                  });

                  newUser.save(function (err, user) {
                     if (err) throw err;
                     //console.log(user);
                  })

                  res.redirect('/activation');
               }
            })

         }
        }
      } catch (error) {
         console.error(error);
      }
   });

passport.use(new LocalStrategy(
   function (username, password, done) {
      User.findOne({
         username: username
      }, function (err, user) {
         if (err) {
            return done(err);
         }

         if (!user) {
            return done(null, false);
         }

         if (user.password != password) {
            return done(null, false);
         }
         return done(null, user);
      });
   }
));

passport.serializeUser(function (user, done) {
   done(null, user.id);
});

passport.deserializeUser(function (id, done) {
   User.findById(id, function (err, user) {
      done(err, user);
   });
});

router.get('/activation', async function (req, res) {
   try {
      await new Promise(r => setTimeout(r, 2000));
      const lastInsertedUser = await User.findOne().sort({
         '_id': -1
      });
      const activeCode = lastInsertedUser.activeCode;
      const activationCode = Math.floor(1000 + Math.random() * 9000);
      console.log("lastInsertedUser", lastInsertedUser);

      const mail = {
         //from: data.name,
         to: process.env.EMAIL,
         subject: lastInsertedUser.name + "Registration Request",
         text: `Name: ${lastInsertedUser.name} \n activationCode: ${activationCode} \n UserId: ${lastInsertedUser._id}`,
      };

      if (activeCode === 0 || activeCode == null || activeCode.length == 0) {


         transporter.sendMail(mail, (err, data) => {
            if (err) {
               console.log(err);
               console.log("Something went wrong.");
            } else {
               console.log("Email Send successfully.");
               res.render('pages/user/activation', {
                  message: "Your account is in process, Please wait until admin not approved."
               });
            }
         });

      } else {
         res.render('pages/user/login');
      }

   } catch (error) {
      console.log(error);
   }

});

router.post('/login', async (req, res, next) => {
   const checkActivecode = await User.find({
      username: req.body.username
   });

   const activeCode = checkActivecode.some(active => active.activeCode == 0 || active.activeCode == null || active.activeCode.lenght == 0);

   if (activeCode) {
      res.render('pages/user/activation', {
         message: "Your Account is in process , Please wait until Admin not approve"
      });
   } else {
      passport.authenticate('local', {
         successRedirect: '/',
         failureRedirect: '/login',
         failureFlash: true
      })(req, res, next)
   }

})


router.get('/activeUser', superAdminAuthenticated, function (req, res) {
   res.render('pages/user/activeUser');
});

router.post('/activeUser', superAdminAuthenticated, async function (req, res) {
   const data = {
      activeCode: req.body.activeCode
   };
   await User.findByIdAndUpdate(req.body.UserId, data, {
      new: true
   }, function (err, result) {
      try {
         if (!err) {
            res.redirect('/activeUser')
         }
      } catch (error) {
         console.error(error);
      };
   })

});


router.get('/logout', async function (req, res) {
    try{
         await req.logout();
         return res.redirect('/login')
    }
    catch(error){
      console.log(error);
    }
});

/*------Users------*/

router.get('/profile', ensureAuthenticated, async (req, res) => {
   const profile = await UserProfile.find({
      uid: req.user._id
   });

   res.render('pages/user/profile', {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      email: req.user.email,
      profile_img: req.user.profile_img,
      name: req.user.name,
      profile
   });
});

router.post('/createProfile', ensureAuthenticated, Upload.single("image"), async (req, res) => {
   try {
      const geturl = await cloudinary.uploader.upload(req.file.path);
      console.log(geturl);
      const profile = new UserProfile({
         username: req.body.username,
         name: req.body.name,
         email: req.body.email,
         profile_img: geturl.secure_url,
         role: req.user.role,
         address: req.body.address,
         phone: req.body.phone,
         uid: req.user._id,
         public_id: geturl.public_id,
      })
      console.log(profile);
      await profile.save()
      res.redirect('/profile')
   } catch (error) {
      console.error(error);
   }
})


router.post('/updateProfile', ensureAuthenticated, Upload.single("image"), async (req, res) => {
   try {
      if (!req.file) {
         return res.send('Please upload a file')
      }
      let profile = await UserProfile.findById(req.body.id);
      await cloudinary.uploader.destroy(profile.public_id);

      // Upload image to cloudinary
      const geturl = await cloudinary.uploader.upload(req.file.path);
      const data = {
         username: req.body.username || profile.username,
         name: req.body.name || profile.name,
         email: req.body.email || profile.email,
         profile_img: geturl.secure_url,
         //role:  req.user.role,  
         address: req.body.address || profile.address,
         phone: req.body.phone || profile.phone,
         //uid:req.user._id,
         public_id: geturl.public_id || profile.public_id,
      };
      await UserProfile.findByIdAndUpdate(req.body.id, data, {
         new: true
      }, function (err, result) {
         try {
            if (!err) {
               res.redirect('/profile')
            }
         } catch (error) {
            console.error(error);
         };
      })
   } catch (err) {
      console.log(err);
   }

});


router.get('/usersList', superAdminAuthenticated, async (req, res) => {
   const users = await User.find({}, {
      _id: 1,
      name: 1,
      role: 1
   });
   res.render('pages/user/usersList', {
      users
   })
});

router.post('/updateUserRole', superAdminAuthenticated, async (req, res) => {
   const todo = await User.findByIdAndUpdate(req.body.id, {
      $set: req.body
   }, {
      new: true
   }, function (err, result) {
      try {
         if (!err) {
            res.redirect('/usersList')
         }
      } catch (error) {
         console.error(error);
      }
   });
});

module.exports = router;