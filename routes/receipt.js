const { Router } = require('express')
const router = Router()
const Todo = require('../models/Receipt')
const path = require('path')
const Upload  = require("../helpers/upload");
const cloudinary = require("../helpers/cloudinary");

router.get('/', async (req, res) => {
    res.render('index')

})
router.get('/receipt', ensureAuthenticated, async (req, res) => {
    const todos = await Todo.find({}).lean()
    
    res.render('receipt', {
    fullName: 'Tasks list page...',
    fname: 'Tasks list page...',
    isIndex: true,
    todos
    })

})
router.get('/view',ensureAuthenticated, async (req, res) => {
    const todos = await Todo.find({}).lean()
    
    res.render('view', {
    fullName: 'Tasks list page...',
    fname: 'Tasks list page...',
    isIndex: true,
    todos
    })

})

router.get('/create', ensureAuthenticated,(req, res) => {
    res.render('create', {
    fullName: 'Create a new task page...',
    fname: 'Create a new task page...',
    isCreate: true
    })
})

router.post('/create',ensureAuthenticated, Upload.single("image"), async (req, res) => {
    try {
    const geturl = await cloudinary.uploader.upload(req.file.path);
    const todo = new Todo({
        fullName: req.body.fullName,
        address: req.body.address,
        amount: req.body.amount,
        image: geturl.secure_url,
        phone: req.body.phone,  
        occasion: req.body.occasion      
    })
    await todo.save()
    res.redirect('/')
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
    
    const todo = await Todo.findByIdAndDelete(req.body.id)

    res.redirect('/')
})

router.post('/update', ensureAuthenticated, async (req, res) => {
   
    const todo = await Todo.findByIdAndUpdate(req.body.id,{$set:req.body},{new:true}, function(err, result){
        try {
            if (!err) {
                res.redirect('/')
            }
          } catch (error) {
            console.error(error);
          }
    });

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