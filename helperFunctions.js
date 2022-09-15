const jwt = require('jsonwebtoken');
const process = require('process');
const multer = require('multer');
const path = require('path');


const TOKEN_KEY = process.env.TOKEN_KEY;
const maxAge = 3 * 24 * 60 * 60;


const createToken = (user_id, user_mail) => {
  return jwt.sign({ user_id: user_id, user_mail }, TOKEN_KEY, {
    expiresIn: maxAge,
  });
};

const convertFormErrorObjToArr = (errObjArr) => {
  return errObjArr.map((errObj) => {
    return errObj.msg;
  });
};

// renders message back to frontend
const renderFeedbackMessage = (responseObject, routeTo, title, errors, userObj, messageType, others) => {
  const messageContext = {
    title,
    errors,
    user: userObj, // added it for rendering of error pages
    messageType,
    ...others
  };
  return responseObject.render(routeTo, messageContext);
};

// helps to exclude routes from any middleware
const unless = (middleware, routes) => {
  return (req, res, next) => {
    if (routes.includes(req.path)) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};

const profileImageStorage = multer.diskStorage({
  destination: function (req, file, callback){
    callback(null, './public/uploads/images')
  },
  filename: function (req, file, callback){
    callback(null, Date() + "-" + file.originalname)
  }
})

const imageWhitelist = [
  'image/png',
  'image/jpeg',
  'image/jpg',
]

const uploadProfileImage = multer({storage: profileImageStorage,
  fileFilter: function (req, file, callback) {
    if (!imageWhitelist.includes(file.mimetype)) {
      callback(null, false)
      return callback(new Error('Only .png, .jpg and .jpeg format allowed!'));
    } else {
      callback(null, true)
    }
  }}).single('profileImage')

module.exports = {
  unless,
  renderFeedbackMessage,
  convertFormErrorObjToArr,
  createToken,
  maxAge,
  uploadProfileImage
};
