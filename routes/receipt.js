const { Router } = require('express')
const router = Router()
const Todo = require('../models/Receipt')
const path = require('path')
const Upload  = require("../helpers/upload");
const cloudinary = require("../helpers/cloudinary");
const { check, validationResult } = require('express-validator');
const {superAdminAuthenticated, adminAuthenticated, ensureAuthenticated} = require('../middleware/auth');
const UserProfile = require('../models/Profile');
const User = require('../models/User');

router.get('/receipt', adminAuthenticated, async (req, res) => {
    const todos = await Todo.find({}).lean()
    const getNotCompletedCount =  await Todo.aggregate([{ $match: {completed:false} }, { $group: { _id: null, TotalSum: { $sum: "$amount" } } } ]);
    const getAllCount =  await Todo.aggregate([ { $group: { _id: null, TotalSum: { $sum: "$amount" } } } ]); 
    res.render('pages/receipt/receipt', {
    todos,
    getNotCompletedCount,
    getAllCount
    })
})
router.get('/view',adminAuthenticated, async (req, res) => {
    const todos = await Todo.find({}).lean()  
    res.render('pages/receipt/view', {
    todos
    })
})

router.get('/userReceipt',ensureAuthenticated, async (req, res) => {
    const userReceipt = await Todo.find({ uid: req.user._id}).lean()  
    res.render('pages/receipt/userReceipt', {
    userReceipt
    })
})

router.get('/createReceipt', ensureAuthenticated, async(req, res) => {
    const receiptProfile = await UserProfile.find({
        uid: req.user._id
        }).lean();
    const userInfo = await User.find({ _id: req.user._id});
    req.flash('receiptFails', 'Something went wrong');
    res.render('pages/receipt/create', {
    receiptProfile,
    userInfo
    })
})

router.post('/createReceipt',ensureAuthenticated, Upload.single("image"),
[
check('fullName', 'The Full Name must have atleast 3 characters').exists().isLength({ min: 3 }),
check('address', 'The address must have atleast 3 characters').exists().isLength({ min: 3 }),
check('amount', 'The amount must have atleast 3 numbers numbers only').exists().isLength({ min: 3 }).isNumeric(),
check('occasion', 'The occasion must have atleast 3 characters').exists().isLength({ min: 3 }),
check('familyMembers', 'The family Members must have atleast 1 numbers numbers only').exists().isLength({ min: 1 }).isNumeric(),
check('phone').custom(phone => {
    if(phone.match(/^^[6-9]\d{9}$$/)) {
      return true;
    }
  }).withMessage("Please enter valid phone number."),
],
async (req, res) => {  
console.log(req.body);

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        // return res.status(422).jsonp(errors.array())
        const alert = errors.array()
        res.render('pages/receipt/create', {
            alert
        })
    }
    else{
        try {
    const geturl = await cloudinary.uploader.upload(req.file.path);
    
    const todo = new Todo({
        fullName: req.body.fullName,
        address: req.body.address,
        amount: req.body.amount,
        image: geturl.secure_url,
        phone: req.body.phone,  
        occasion: req.body.occasion,
        familyMembers: req.body.familyMembers,
        uid:req.user._id,
        public_id: geturl.public_id     
    })
    await todo.save()
    req.flash('rceiptSuccess', 'Receipt created successfully!');
    res.redirect('/userReceipt')

     } catch (error) {
            console.error(error);
          }
        }
})

router.post('/complete', adminAuthenticated,async (req, res) => {
    const todo = await Todo.findById(req.body.id)
    if(req.user.role === 0){
        todo.completed = !!req.body.completed
        await todo.save()
          return res.redirect('/receipt');
        }
        else{
            todo.completed = !!req.body.completed
           await todo.save()
              return res.redirect('/view');
        }
})

router.post('/delete', adminAuthenticated, async (req, res) => {

    const todo = await Todo.findByIdAndDelete(req.body.id);
    let receipt = await Todo.findById(req.body.id);
    await cloudinary.uploader.destroy(receipt.public_id);

    res.redirect('/receipt')
})

router.post('/update', adminAuthenticated, Upload.single("image"), async (req, res) => {
    
    try {
        if (!req.file){return res.send('Please upload a file')} 
        let receipt = await Todo.findById(req.body.id);
        await cloudinary.uploader.destroy(receipt.public_id);
        
        // Upload image to cloudinary
        const geturl = await cloudinary.uploader.upload(req.file.path);
        const data = {
            fullName: req.body.fullName || receipt.fullName,
            address: req.body.address || receipt.address,
            amount: req.body.amount || receipt.amount,
            image: geturl.secure_url,
            phone: req.body.phone || receipt.phone,  
            occasion: req.body.occasion || receipt.occasion,
            public_id: geturl.public_id || receipt.public_id,
        };
        await Todo.findByIdAndUpdate(req.body.id, data, {new: true}, function(err, result){
            try {
                if (!err) {
                    res.redirect('/receipt')
                }
              } catch (error) {
                console.error(error);
              };
      }) }
      catch (err) {
        console.log(err);
      }

    });

module.exports = router