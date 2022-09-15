const express = require("express");
const blogController = require("../controllers/blogController");
const { body } = require("express-validator");
const router = express.Router();

router.get("/", blogController.blog_index);

router.post(
  "/",
  body("title").trim(),
  body("snippet").trim(),
  blogController.blog_create_post
);

router.get("/create", blogController.blog_create_get);

router.get("/:id", blogController.blog_details);

router.delete("/:id", blogController.blog_delete);

router.post("/:id", body("comment").trim(), blogController.blog_add_comment);

module.exports = router;
