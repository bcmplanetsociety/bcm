var express = require('express');
var router = express.Router();
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
require("dotenv").config();
const Event = require('../models/Event');
const Requirement = require('../models/Requirement');
const Service = require('../models/Service');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

router.get('/', async (req, res) => {
   //for Current Date
   var LocalStart_Date = moment().endOf('day').format("YYYY-MM-DD");
   var Start_Date = LocalStart_Date + "T02:30:00.000Z";

   //for Upcoming Date
   var LocalUpcoming_Date = moment().add(31, 'days').format("YYYY-MM-DD");
   var Upcoming_Date = LocalUpcoming_Date + "T02:30:00.000Z";

   //for Old Date
   var LocalOld_Date = moment().subtract(31, 'days').format("YYYY-MM-DD");
   var Old_Date = LocalOld_Date + "T02:30:00.000Z";

   //for Requirement
   var LocalOld_Date = moment().subtract(10, 'days').format("YYYY-MM-DD");
   var Old_Date = LocalOld_Date + "T02:30:00.000Z";

   const upcomingEvent = await Event.find({
      $and: [{
         "time": {
            $gt: Start_Date
         }
      }, {
         "time": {
            $lt: Upcoming_Date
         }
      }]
   });
   const OldEvent = await Event.find({
      time: {
         $gte: Old_Date,
         $lte: Start_Date
      }
   });


   //Today date
   const todayDate = moment();
   const CurrentDate = moment.utc(todayDate).local().format();
   const todayDate_to10 = moment.utc(todayDate).local().subtract(10, 'days').format();

   const Requirements = await Requirement.find({
      Date: {
         $gte: todayDate_to10,
         $lte: CurrentDate
      }
   });
   const Services = await Service.find({
      Date: {
         $gte: todayDate_to10,
         $lte: CurrentDate
      }
   });

   const success = req.flash('You are login Successfully');
   res.render('index', {
      isIndex: true,
      upcomingEvent,
      OldEvent,
      moment,
      success,
      Requirements,
      Services
   })
})

const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com", //replace with your email provider
   port: 587,
   auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
   },
});

router.post("/contact", (req, res) => {

   let form = new multiparty.Form();
   let data = {};
   form.parse(req, function (err, fields) {
      console.log(fields);
      Object.keys(fields).forEach(function (property) {
         data[property] = fields[property].toString();
      });

      // You can configure the object however you want
      const mail = {
         from: data.name,
         to: process.env.EMAIL,
         subject: "BCM Email",
         text: `${data.name} <${data.email}> \n${data.message}`,
      };

      transporter.sendMail(mail, (err, data) => {
         if (err) {
            console.log(err);
            res.status(500).send("Something went wrong.");
         } else {
            res.status(200).redirect('/');
         }
      });
   });
});

module.exports = router;