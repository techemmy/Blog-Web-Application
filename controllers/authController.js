const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  renderFeedbackMessage,
  createToken,
  convertFormErrorObjToArr,
  maxAge
} = require("../helperFunctions");
const { validationResult } = require("express-validator");

// ROUTES HANDLER: register_get, user_create_post, login, user_login_post, user_logout_get

const register_get = (req, res) => {
  res.render("./auth/register", { title: "Register" });
};

const user_create_post = (req, res, next) => {
  const errors = validationResult(req);
  // handles form validation error
  if (!errors.isEmpty()) {
    const errorsList = convertFormErrorObjToArr(errors.array());
    return renderFeedbackMessage(
      res,
      "./auth/register",
      "Register",
      errorsList,
      res.locals.user,
      "danger"
    );
  }

  // Get user input
  const { username, email, password } = req.body;

  // Validate if user exist in our database
  const oldUser = User.findOne({ email })
    .then((isOldUser) => {
      // user exists
      if (isOldUser) {
        return renderFeedbackMessage(
          res,
          "./auth/register",
          "Register",
          ["User Already Exist. Create a new account."],
          res.locals.user,
          "danger"
        );
      }

      // Create user in our database
      const user = new User({
        username: username,
        email: email.toLowerCase(), // sanitize
        password: password,
      });

      // Create authentication token
      const token = createToken(user._id, email);
      // save new user
      user
        .save()
        .then((userDoc) => {
          // save user authentication token
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000,
          });
          return res.redirect("/");
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

const login_get = (req, res) => {
  res.render("./auth/login", { title: "Login" });
};

const user_login_post = (req, res, next) => {
  const { email, password } = req.body;
  // handles form validation error
  const errors = validationResult(req);
  const errorsList = convertFormErrorObjToArr(errors.array());
  if (!errors.isEmpty()) {
    return renderFeedbackMessage(
      res,
      "./auth/login",
      "Login",
      errorsList,
      res.locals.user,
      "danger"
    );
  }

  User.findOne({ email })
    .then(existingUser => {
      if (!existingUser) {
        return renderFeedbackMessage(
          res,
          "./auth/login",
          "Login",
          ["User does not exist! Create an account!"],
          res.locals.user,
          "danger"
        );
      }
      // Verify User password and authenticate
      bcrypt
        .compare(password, existingUser.password)
        .then((passwordIsCorrect) => {
          if (passwordIsCorrect) {
            // create token
            token = createToken(existingUser._id, existingUser.email);
            // save user authentication token
            res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.redirect("/");
          } else {
            return renderFeedbackMessage(
              res,
              "./auth/login",
              "Login",
              ["Invalid password! Try again."],
              res.locals.user,
              "danger"
            );
          }
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

const user_logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

module.exports = {
  register_get,
  user_create_post,
  login_get,
  user_login_post,
  user_logout_get,
};
