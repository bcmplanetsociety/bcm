const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserProfile = require('../models/Profile');
const User = require('../models/User');
const path = require('path')
const Upload = require("../helpers/upload");
const cloudinary = require("../helpers/cloudinary");
const fs = require('fs');

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
            const alert = errors.array()
            res.render('pages/user/register', {
               alert
            })
         } else {
            var name = req.body.name;
            var email = req.body.email;
            var username = req.body.username;
            var password = req.body.password;
            var password2 = req.body.password2;
            var role = req.body.role; {
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
                     req.flash('signupSuccess', 'Your Details sent to admin, you have to wait untill admin approved!');
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
      const activeUser = lastInsertedUser.activeUser;
      console.log("lastInsertedUser", lastInsertedUser);
      const mail = {
         //from: data.name,
         to: process.env.EMAIL,
         subject: lastInsertedUser.name + "Registration Request",
         text: `Name: ${lastInsertedUser.name}  \n UserId: ${lastInsertedUser._id} \n UserEmail: ${lastInsertedUser.email}`,
      };
      if (activeUser === false) {
         transporter.sendMail(mail, (err, data) => {
            if (err) {
               console.log(err);
               console.log("Something went wrong.");
            } else {
               console.log("Email Send successfully.");
               res.render('pages/user/activation', {
                  message: "Your account is in process, After admin approval you will get email."
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
   const activeUser = checkActivecode.some(active => active.activeUser === false);
   if (activeUser) {
      res.render('pages/user/activation', {
         message: "Your Account is in process , Please wait until Admin not approve"
      });
   } else {
      passport.authenticate('local', {
         successRedirect: '/',
         failureRedirect: '/login',
         failureFlash: true
      })(req, res, next)
      req.flash('loginSuccess', 'Welcome to BCM!!');
      req.flash('loginFails', 'Your username or password is wrong');
   }
})
router.get('/activeUser', superAdminAuthenticated, function (req, res) {
   res.render('pages/user/activeUser');
});
router.post('/activeUser', superAdminAuthenticated, async function (req, res) {
   const data = {
      activeUser: req.body.activeUser
   };
   await User.findByIdAndUpdate(req.body.UserId, data, {
      new: true
   }, function (err, result) {
      try {
         if (!err) {
            const mail = {
               from: "bcmplanetsociety@gmail.com",
               to: `${req.body.email}`,
               subject: "BCM Planet Account",
               text: `Hello ${req.body.name} your account is activated successfully, now you can login to your account`,
            };
            transporter.sendMail(mail, (err, data) => {
               if (err) {
                  console.log(err);
                  console.log("Something went wrong.");
               } else {
                  console.log("Email Send successfully.");
                  //    res.render('pages/user/activation', {
                  //       message: "Your account is in process, Please wait until admin not approved."
                  //    });
                  res.redirect('/activeUser')
               }
            });
         }
      } catch (error) {
         console.error(error);
      };
   })
});
router.get('/logout', async function (req, res) {
   try {
      await req.logout();
      req.flash('logoutSuccess', 'Successfully Logout');
      return res.redirect('/login')
   } catch (error) {
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
      await profile.save()
      req.flash('profileSuccess', 'Your Profile Upadated successfully!');
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
      // _id: 1,
      // name: 1,
      // role: 1
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
            req.flash('roleUpdateSuccess', 'User Role Upadated successfully!');
            res.redirect('/usersList')
         }
      } catch (error) {
         console.error(error);
      }
   });
});


router.get('/reset-password', function (req, res) {
   res.render('pages/user/password_reset');
});
router.get('/otp-confirmation', function (req, res) {
   res.render('pages/user/otp');
});
router.post('/reset-password', async function (req, res) {
   const checkUserEmail = await User.find({
      email: req.body.email
   });
   if (req.body.email == checkUserEmail[0].email) {
      const otp = Math.floor(1000 + Math.random() * 9000);

      //send otp into a .txt file
      var stream = fs.createWriteStream(`./helpers/otp/${otp}.txt`);
      stream.once('open', function (fd) {
         stream.write(`${otp}`);
         stream.end();
      });

      await new Promise(r => setTimeout(r, 1000));

      const mail = {
         from: `${req.body.email}`,
         to: `${req.body.email}`,
         subject: "BCM Planet Account OTP",
         text: `Hello ${req.body.email} your account OTP is ${otp}`,
      };
      transporter.sendMail(mail, (err, data) => {
         if (err) {
            console.log(err);
            console.log("Something went wrong.");
         } else {
            console.log("Email Send successfully.");
            res.render('pages/user/otp', {
               id: checkUserEmail[0]._id
            });

         }
      });
   } else {
      console.log("Email is not available");
   }
});

router.post('/otp-confirmation', async function (req, res) {
   try {
      if (fs.existsSync(`./helpers/otp/${req.body.otp}.txt`)) {
         fs.readFile(`./helpers/otp/${req.body.otp}.txt`, 'utf8', (err, data) => {
            if (err) {
               console.error(err);
               return;
            } else {
               if (req.body.otp == data) {
                  const data = {
                     password: req.body.password,
                  };
                  User.findByIdAndUpdate(req.body.id, data, function (err, result) {
                     try {
                        if (!err) {
                           req.flash('PasswordChangeSuccess', 'Your password is successfully changed');
                           res.redirect('/login')
                        }
                     } catch (error) {
                        console.error(error);
                     };
                  })
               } else {
                  console.log("Please Enter Valid OTP");
               }
            }
         });
      } else {
         console.log("no files are available");
      }

   } catch (err) {
      console.error(err)
   }
});

module.exports = router;