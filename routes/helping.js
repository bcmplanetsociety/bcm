const { Router } = require('express')
const router = Router()
const Helping = require('../models/Helping');
const { check, validationResult } = require('express-validator');
const {superAdminAuthenticated, adminAuthenticated, ensureAuthenticated} = require('../middleware/auth');

router.get('/helping', adminAuthenticated, async (req, res) => {
    const helping = await Helping.find({}).lean()  
    res.render('pages/helping', {
        helping:helping
    })
})

router.post('/helping',ensureAuthenticated, async (req, res) => {
    try {
    
    const helping = new Helping({
        name: req.body.name,
        phone: req.body.phone,
        profession: req.body.profession,
    })
    await helping.save()
    req.flash('helpingSuccess', 'Help is created successfully!');
    res.redirect('/helping')
     } catch (error) {
            console.error(error);
          }
        
})

module.exports = router;

