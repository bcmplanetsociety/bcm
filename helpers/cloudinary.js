require('dotenv').config()
const cloudinary = require('cloudinary').v2


cloudinary.config({
    cloud_name : "dutqnd5m3",
    api_key : "517392588469235",
    api_secret : "ctJAvosfj_iENdE7LW0yrmkYQlM"
})

module.exports = cloudinary