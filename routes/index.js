var express = require('express');
var router = express.Router();
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
require("dotenv").config();
const Event = require('../models/Event');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

router.get('/', async (req, res) => {
  //for Current Date
  var LocalStart_Date =  moment().endOf('day').format("YYYY-MM-DD");
  var Start_Date =  LocalStart_Date + "T02:30:00.000Z";

  //for Upcoming Date
  var LocalUpcoming_Date = moment().add(31 ,'days').format("YYYY-MM-DD");
  var Upcoming_Date = LocalUpcoming_Date + "T02:30:00.000Z";

  //for Old Date
  var LocalOld_Date = moment().subtract(31 ,'days').format("YYYY-MM-DD");
  var Old_Date = LocalOld_Date + "T02:30:00.000Z";

  const upcomingEvent = await Event.find({ $and: [ {"time": {$gt: Start_Date}}, {"time": {$lt: Upcoming_Date}} ] });
  const OldEvent = await Event.find({ time : { $gte :  Old_Date, $lte : Start_Date}});
  
  
  res.render('index', {
  isIndex: true,
  upcomingEvent,
  OldEvent,
  moment
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