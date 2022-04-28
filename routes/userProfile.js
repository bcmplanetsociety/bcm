const { Router } = require('express')
const router = Router()
const UserProfile = require('../models/Profile');
const path = require('path')
const Upload  = require("../helpers/upload");
const cloudinary = require("../helpers/cloudinary");


router.post('/createProfile',ensureAuthenticated, Upload.single("image"), async (req, res) => {
    try {
    const geturl = await cloudinary.uploader.upload(req.file.path);
    console.log(geturl);
    const profile = new UserProfile({
        username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            profile_img: geturl.secure_url,
            role:  req.user.role,  
            address: req.body.address,
            phone: req.body.phone,
            uid:req.user._id,
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
        if (!req.file){return res.send('Please upload a file')} 
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
        await UserProfile.findByIdAndUpdate(req.body.id, data, {new: true}, function(err, result){
            try {
                if (!err) {
                    res.redirect('/profile')
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