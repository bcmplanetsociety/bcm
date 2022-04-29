const { Router } = require('express')
const router = Router()
const Event = require('../models/Event');

router.get('/event', ensureAuthenticated, async (req, res) => {
    const event = await Event.find({}).lean()  
    res.render('pages/event/event', {
    isIndex: true,
    event
    })
})
router.get('/userView', async (req, res) => { 
    res.render('pages/event/userView', {
             isIndex: true,
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

router.get('/viewEvent',ensureAuthenticated, async (req, res) => {
    const event = await Event.find({}).lean()  
    res.render('pages/event/view', {
    isIndex: true,
    event
    })
})

router.get('/createEvent', ensureAuthenticated,(req, res) => {
    res.render('pages/event/create', {
    isCreate: true,
    })
})

router.post('/userView', async(req, res) => {
    //console.log(req.body.id);
    const eventbyId = await Event.findById(req.body.id)
     res.render('./pages/event/userView', {
     isCreate: true,
     eventbyId
     })
})



router.post('/createEvent',ensureAuthenticated, async (req, res) => {
    try {
    const event = new Event({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        location: req.body.location,  
        arragedBy: req.body.arragedBy,
        time: req.body.time, 
        uRole: req.user.role
    })
    await event.save()
    res.redirect('/event')
     } catch (error) {
            console.error(error);
          }
})

router.post('/completeEvent', ensureAuthenticated,async (req, res) => {
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


router.post('/deleteEvent', ensureAuthenticated, async (req, res) => {

    const event = await Event.findByIdAndDelete(req.body.id);

    res.redirect('/event')
})

router.post('/updateEvent', ensureAuthenticated, async (req, res) => {
    try {
        let event = await Event.findById(req.body.id);
  
        const data = {
            name: req.body.name || event.name,
            description: req.body.description || event.description,
            price: req.body.price || event.price,
            location: req.body.phone || event.location,  
            arragedBy: req.body.arragedBy || event.arragedBy,
            time: req.body.time || event.time, 
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

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/login');
    }
}

module.exports = router;