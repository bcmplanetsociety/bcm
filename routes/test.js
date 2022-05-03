const { Router } = require('express')
const router = Router();
const Event = require('../models/Event');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

router.get('/test', async(req, res) => {
   //for Current Date
   var LocalStart_Date =  moment().endOf('day').format("YYYY-MM-DD");
   var Start_Date =  LocalStart_Date + "T02:30:00.000Z";

   //for Upcoming Date
   var LocalUpcoming_Date = moment().add(31 ,'days').format("YYYY-MM-DD");
   var Upcoming_Date = LocalUpcoming_Date + "T02:30:00.000Z";

   //for Old Date
   var LocalOld_Date = moment().subtract(31 ,'days').format("YYYY-MM-DD");
   var Old_Date = LocalOld_Date + "T02:30:00.000Z";

   
   //console.log("2018-07-03T02:30:00.000Z"); //getting default time from database
   //console.log(Start_Date);
   //console.log(Upcoming_Date);
   const upcomingEvent = await Event.find({ $and: [ {"time": {$gt: Start_Date}}, {"time": {$lt: Upcoming_Date}} ] });
   const OldEvent = await Event.find({ time : { $gte :  Old_Date, $lte : Start_Date}});
   console.log("welcome", OldEvent);
})


module.exports = router;