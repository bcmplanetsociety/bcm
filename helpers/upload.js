const multer = require('multer')
const path = require('path')

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter : (req , file , cb) =>{
        let ext = path.extname(file.originalname)
        if (ext !== ".JPG" && ext !== ".jpg" &&  ext !== ".jpeg" && ext !== ".png"){
            cb(new Error("Only .png, .jpg and .jpeg format allowed!"), false)
            return
        }
        cb(null , true)
    }
})