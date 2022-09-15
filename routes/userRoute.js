const express = require("express");
const userController = require("../controllers/userController");
const { body } = require("express-validator");
const { uploadProfileImage } = require("../helperFunctions");

const router = express.Router();

router.get("/", userController.user_profile_get);

router.get("/edit-profile", userController.edit_profile_get);

router.post(
  "/edit-profile",
  body("username").trim(),
  body("oldPassword").trim(),
  body("newPassword").trim(),
  userController.edit_profile_post
);

router.get("/comments", userController.user_comments_get)

router.get("/:id", userController.user_profile_get);

router.post(
  "/:id/upload/profile-img",
  uploadProfileImage,
  userController.upload_profile_image_post
);


module.exports = router;
