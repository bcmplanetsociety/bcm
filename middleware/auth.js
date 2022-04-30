
//For SuperAdmin user
const superAdminAuthenticated = (req, res, next) => {
    if(req.user){
    if(req.user.role === 0){
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/login');
    }
}
}

//For Admin user
const adminAuthenticated = (req, res, next) => {
    if(req.user){
    if(req.user.role === 0 || req.user.role === 1){
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/login');
    }
   }
}

//For Normal user
const ensureAuthenticated = (req, res, next) => {
if(req.isAuthenticated()){
    return next();
} else {
    //req.flash('error_msg','You are not logged in');
    res.redirect('/login');
}
}


module.exports = {
    superAdminAuthenticated,
    adminAuthenticated,
    ensureAuthenticated 
};