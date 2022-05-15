const { Router } = require('express')
const router = Router()
const Event = require('../models/Event');
const { check, validationResult } = require('express-validator');
const {superAdminAuthenticated, adminAuthenticated, ensureAuthenticated} = require('../middleware/auth');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;
const Upload  = require("../helpers/upload");
const cloudinary = require("../helpers/cloudinary");

router.get('/event', adminAuthenticated, async (req, res) => {
    const event = await Event.find({}).lean()  
    res.render('pages/event/event', {
    event,
    moment
    })
})
router.get('/userView', async (req, res) => { 
    const eventbyId = await Event.findById(req.body.id)
    console.log(eventbyId);
    res.render('pages/event/userView', {
             moment,
             eventbyId
             })
})

// router.get('/ViewEvents', ensureAuthenticated, async (req, res) => {
//     console.log(req.body); 
//     const event = await Event.find({}).lean()  
//     res.render('pages/event/userView', {
//     isIndex: true,
//     event
//     })
// })

router.get('/viewEvent',adminAuthenticated, async (req, res) => {
    const event = await Event.find({}).lean()  
    res.render('pages/event/view', {
    event
    })
})

router.post('/userView', async(req, res) => {
    //console.log(req.body.id);
    const eventbyId = await Event.findById(req.body.id)
     res.render('./pages/event/userView', {
     eventbyId,
     moment
     })
})

router.get('/create', adminAuthenticated, async(req, res) => {
    const event = await Event.find({ uid: req.user._id}).lean();  
    req.flash('eventsFails', 'Something went wrong');
    res.render('pages/event/create',{
        event,
    })
})

router.post('/create',adminAuthenticated, Upload.single("image", {
    upload_preset: 'Events'
   }), 
[
    check('name', 'The Name must have atleast 3 characters').exists().isLength({ min: 3 }),
    check('description', 'The description must have atleast 3 characters').exists().isLength({ min: 3 }),
    check('price', 'The price must have atleast 3 numbers numbers only').exists().isLength({ min: 3 }).isNumeric(),
    check('location', 'The location must have atleast 3 characters').exists().isLength({ min: 3 }),
    check('arragedBy', 'The Contact persont name must have atleast 3 characters').exists().isLength({ min: 3 }),
    check('time', 'The time must have atleast 3 characters').not().isEmpty(),
    ],

async (req, res) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        // return res.status(422).jsonp(errors.array())
        const alert = errors.array()
        res.render('pages/event/create', {
            alert
        })
    }
    else{
    try {
        const geturl = await cloudinary.uploader.upload(req.file.path);
    const event = new Event({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        location: req.body.location,  
        arragedBy: req.body.arragedBy,
        time: req.body.time,
        image: geturl.secure_url, 
        uRole: req.user.role,
        uid:req.user._id,
        public_id: geturl.public_id 
    })
    await event.save()
    req.flash('eventSuccess', 'Event is created successfully!');
    res.redirect('/event')
     } catch (error) {
            console.error(error);
          }
        }
})

router.post('/completeEvent', adminAuthenticated,async (req, res) => {
    const event = await Event.findById(req.body.id)
    if(req.user.role === 0){
    event.completed = !!req.body.completed
    await event.save()
      return res.redirect('/event');

    }
    else{
        event.completed = !!req.body.completed
        await event.save()
          return res.redirect('/viewEvent');
    }

})


router.post('/deleteEvent', adminAuthenticated, async (req, res) => {

    const event = await Event.findByIdAndDelete(req.body.id);
    let deleteEvent = await Event.findById(req.body.id);
    await cloudinary.uploader.destroy(deleteEvent.public_id);

    res.redirect('/event')
})

router.post('/updateEvent', adminAuthenticated, Upload.single("image",{
    upload_preset: 'Events'
   }),
// [
//     check('name', 'The Name must have atleast 3 characters').exists().isLength({ min: 3 }),
//     check('description', 'The description must have atleast 3 characters').exists().isLength({ min: 3 }),
//     check('price', 'The price must have atleast 3 numbers numbers only').exists().isLength({ min: 3 }).isNumeric(),
//     check('location', 'The location must have atleast 3 characters').exists().isLength({ min: 3 }),
//     check('arragedBy', 'The Contact persont name must have atleast 3 characters').exists().isLength({ min: 3 }),
//     check('time', 'The time must have atleast 3 characters').exists().isLength({ min: 3 }),
//     ],
async (req, res) => {

    // const errors = validationResult(req)
    // if(!errors.isEmpty()) {
    //     // return res.status(422).jsonp(errors.array())
    //     const alert = errors.array()
    //     res.render('pages/event/event', {
    //         alert
    //     })
    // }

    try {
        if (!req.file){return res.send('Please upload a file')} 
        let event = await Event.findById(req.body.id);
        await cloudinary.uploader.destroy(event.public_id);
        // Upload image to cloudinary
        const geturl = await cloudinary.uploader.upload(req.file.path);

        const data = {
            name: req.body.name || event.name,
            description: req.body.description || event.description,
            price: req.body.price || event.price,
            location: req.body.phone || event.location,  
            arragedBy: req.body.arragedBy || event.arragedBy,
            time: req.body.time || event.time, 
            image: geturl.secure_url,
        };
        await Event.findByIdAndUpdate(req.body.id, data, {new: true}, function(err, result){
            try {
                if (!err) {
                    res.redirect('/event')
                }
              } catch (error) {
                console.error(error);
              };
      }) }
      catch (err) {
        console.log(err);
      }

    });

module.exports = router;