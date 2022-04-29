const { Router } = require('express')
const router = Router()
const Todo = require('../models/Receipt')
const path = require('path')
const Upload  = require("../helpers/upload");
const cloudinary = require("../helpers/cloudinary");


router.get('/receipt', ensureAuthenticated, async (req, res) => {
    const todos = await Todo.find({}).lean()
    
    res.render('pages/receipt/receipt', {
    fullName: 'Tasks list page...',
    fname: 'Tasks list page...',
    isIndex: true,
    todos
    })

})
router.get('/view',ensureAuthenticated, async (req, res) => {
    const todos = await Todo.find({}).lean()
    
    res.render('pages/receipt/view', {
    fullName: 'Tasks list page...',
    fname: 'Tasks list page...',
    isIndex: true,
    todos
    })

})

router.get('/create', ensureAuthenticated,(req, res) => {
    res.render('pages/receipt/create', {
    fullName: 'Create a new task page...',
    fname: 'Create a new task page...',
    isCreate: true,
    })
})

router.post('/create',ensureAuthenticated, Upload.single("image"), async (req, res) => {
    try {
    const geturl = await cloudinary.uploader.upload(req.file.path);
    console.log(geturl);
    const todo = new Todo({
        fullName: req.body.fullName,
        address: req.body.address,
        amount: req.body.amount,
        image: geturl.secure_url,
        phone: req.body.phone,  
        occasion: req.body.occasion,
        public_id: geturl.public_id     
    })
    await todo.save()
    res.redirect('/receipt')
     } catch (error) {
            console.error(error);
          }
})

router.post('/complete', ensureAuthenticated,async (req, res) => {
    const todo = await Todo.findById(req.body.id)

    todo.completed = !!req.body.completed
    await todo.save()

    res.redirect('/receipt')
})

router.post('/delete', ensureAuthenticated, async (req, res) => {

    const todo = await Todo.findByIdAndDelete(req.body.id);
    let receipt = await Todo.findById(req.body.id);
    await cloudinary.uploader.destroy(receipt.public_id);

    res.redirect('/receipt')
})

router.post('/update', ensureAuthenticated, Upload.single("image"), async (req, res) => {
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

    function ensureAuthenticated(req, res, next){
        if(req.isAuthenticated()){
            return next();
        } else {
            //req.flash('error_msg','You are not logged in');
            res.redirect('/login');
        }
    }

module.exports = router