const jwt = require("jsonwebtoken");
const User = require("../models/user");

configuations = process.env;

const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    // return res.status(403).send("A token is required for authentication");
    return res.redirect("/auth/login");
  }
  jwt.verify(token, configuations.TOKEN_KEY, (err, decodedToken) => {
    if (err) {
      console.log(err);
      res.redirect("/auth/login");
    } else {
      next();
    }
  });
};

const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  res.locals.errors = null; // sets errors to null for authentication pages get requests e.g Login get request page
  if (token) {
    jwt.verify(token, configuations.TOKEN_KEY, (err, decodedToken) => {
      if (err) {
        console.log(err);
        res.locals.user = null;
        next();
      } else {
        User.findById(decodedToken.user_id)
          .then((user) => {
            res.locals.user = user;
            next();
          })
          .catch((err) => {
            console.log(err);
            next();
          });
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { verifyToken, checkUser };
