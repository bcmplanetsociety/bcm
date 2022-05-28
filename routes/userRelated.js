const {
    Router
 } = require('express')
 const router = Router()
 const {
    superAdminAuthenticated,
    adminAuthenticated,
    ensureAuthenticated
 } = require('../middleware/auth');
 const Complaint = require('../models/Complaint');
 const Requirement = require('../models/Requirement');
 const Service = require('../models/Service');
 const Profile = require('../models/Profile');
 
 //Requirement
 router.get('/requirement', ensureAuthenticated, async (req, res) => {
    const requirement = await Requirement.find({}).lean()
    const service = await Service.find({}).lean()
    const profile = await Profile.find({}).lean()
    res.render('pages/userRelated/requirement', {
       requirement,
       service,
       profile
    })
 })
 
 router.get('/createRequirement', ensureAuthenticated, async (req, res) => {
    const requirement = await Requirement.find({}).lean()
    const service = await Service.find({}).lean()
    const profile = await Profile.find({}).lean()
    res.render('pages/userRelated/createRequirement', {
       requirement,
       service,
       profile
    })
 })
 
 router.post('/createRequirement', ensureAuthenticated, async (req, res) => {
    try {
       const requirement = new Requirement({
          productName: req.body.productName,
          productQuantity: req.body.productQuantity,
          productColor: req.body.productColor,
          budget: req.body.budget,
          description: req.body.description,
          uid: req.user._id,
          uid: req.user._name,
       })
       await requirement.save()
       req.flash('requirementSuccess', 'Your requirement is created successfully!');
       res.redirect('/')
    } catch (error) {
       console.error(error);
    }
 })
 
 router.post('/completeRequirement', adminAuthenticated, async (req, res) => {
    const requirement = await Requirement.findById(req.body.id)
    if (req.user.role === 0) {
       requirement.completed = !!req.body.completed
       await requirement.save()
       return res.redirect('/requirement');
 
    } else {
       requirement.completed = !!req.body.completed
       await requirement.save()
       return res.redirect('/requirement');
    }
 
 })
 
 router.post('/updateRequirement', adminAuthenticated, async (req, res) => {
    try {
       const data = {
          productName: req.body.productName,
          productQuantity: req.body.productQuantity,
          productColor: req.body.productColor,
          budget: req.body.budget,
          description: req.body.description,
       };
       await Requirement.findByIdAndUpdate(req.body.id, data, {
          new: true
       }, function (err, result) {
          try {
             if (!err) {
                res.redirect('/requirement')
             }
          } catch (error) {
             console.error(error);
          };
       })
    } catch (err) {
       console.log(err);
    }
 
 });
 
 router.post('/deleteRequirement', adminAuthenticated, async (req, res) => {
 
    const requirement = await Requirement.findByIdAndDelete(req.body.id);
    let deleteRequirement = await Requirement.findById(req.body.id);
 
    res.redirect('/requirement')
 })
 
 
 //Service
 router.post('/createService', ensureAuthenticated, async (req, res) => {
    try {
       const service = new Service({
          serviceName: req.body.serviceName,
          address: req.body.address,
          phone: req.body.phone,
          description: req.body.description,
          uid: req.user._id,
          uid: req.user._name,
       })
       await service.save()
       req.flash('serviceSuccess', 'Your service is created successfully!');
       res.redirect('/')
    } catch (error) {
       console.error(error);
    }
 })
 
 router.post('/completeService', adminAuthenticated, async (req, res) => {
    const service = await Service.findById(req.body.id)
    if (req.user.role === 0) {
       service.completed = !!req.body.completed
       await service.save()
       return res.redirect('/requirement');
 
    } else {
       requirement.completed = !!req.body.completed
       await requirement.save()
       return res.redirect('/requirement');
    }
 })
 
 router.post('/updateService', adminAuthenticated, async (req, res) => {
    try {
       const data = {
          serviceName: req.body.serviceName,
          address: req.body.address,
          phone: req.body.phone,
          description: req.body.description,
       };
       await Service.findByIdAndUpdate(req.body.id, data, {
          new: true
       }, function (err, result) {
          try {
             if (!err) {
                res.redirect('/requirement')
             }
          } catch (error) {
             console.error(error);
          };
       })
    } catch (err) {
       console.log(err);
    }
 
 });
 
 router.post('/deleteService', adminAuthenticated, async (req, res) => {
 
    const service = await Service.findByIdAndDelete(req.body.id);
    let deleteRequirement = await Service.findById(req.body.id);
 
    res.redirect('/requirement')
 })
 
 
 //Complaint
 router.get('/complaint', ensureAuthenticated, async (req, res) => {
    const complaint = await Complaint.find({}).lean()
    const profile = await Profile.find({}).lean()
    res.render('pages/userRelated/complaint', {
       complaint,
       profile
    })
 })
 
 module.exports = router;