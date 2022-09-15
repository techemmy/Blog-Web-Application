const authController = require("../controllers/authController");
const { body } = require("express-validator");

const express = require("express");
const router = express.Router();

router.get("/register", authController.register_get);

router.post(
  "/register",
  body("username")
    .escape()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Username should be at least 5 characters"),
  body("email", "Email is invalid").isEmail().normalizeEmail(),
  body("password")
    .trim().isLength({ min: 5 })
    .withMessage("Password should be at least a 5 characters"),
  authController.user_create_post
);

router.get("/login", authController.login_get);

router.post(
  "/login",
  body("email", "Enter a valid email").normalizeEmail().isEmail(),
  body("password", "Enter a password!").isLength({ min: 1 }),
  authController.user_login_post
);

router.get("/logout", authController.user_logout_get);

module.exports = router;
