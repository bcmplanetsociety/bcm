var express = require('express');
var router = express.Router();
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
require("dotenv").config();
const Event = require('../models/Event');


router.get('/', async (req, res) => {
  const event = await Event.find({}).lean()  
  res.render('index', {
  isIndex: true,
  event
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