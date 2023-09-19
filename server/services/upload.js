const multer = require('multer');
const path = require('path')
const mime = require('mime-types')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // if (file.fieldname === 'user_profile') {
    //   cb(null, `${__dirname}../../uploads/user`);
    // }
    // if (file.fieldname === 'user_images') {
    //   cb(null, `${__dirname}../../uploads/user_images`);
    // }
    if (file.fieldname === 'category_image') {
      cb(null, `${__dirname}../../uploads/category/`);
    }
    if (file.fieldname === 'subcategory_image') {
      cb(null, `${__dirname}../../uploads/subCategory/`);
    }

    // if (file.fieldname === 'admin_profile') {
    //   cb(null, `${__dirname}../../uploads/admin`);
    // }
    if (file.fieldname === 'doc') {
      var type = mime.extension(file.mimetype)
      if (type == 'xlsx' || type == 'pdf' || type == 'csv'||type=='doc'||type=='docx'||type=='xls') {
        cb(null, `${__dirname}../../uploads/documents`);
      }
    }

  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

const fileFilter = (req, file, cb) => {

  cb(null, true);
}

const upload = multer({
  fileFilter,
  storage
});

module.exports = upload;