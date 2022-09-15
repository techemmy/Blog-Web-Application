const Blog = require("../models/blog");
const BlogLabel = require("../models/blogLabel");
const Comment = require("../models/comment");
const User = require("../models/user");
const { validationResult } = require("express-validator");
// blog_index, blog_details, blog_create_get, blog_create_post, blog_delete

const blog_index = (req, res, next) => {
  Blog.find()
    .populate("labels")
    .sort({ createdAt: -1 })
    .then((blogs) => {
      res.render("blogs/index", { title: "All Blogs", blogs });
    })
    .catch((err) => {
      next(err);
    });
};

const blog_details = (req, res, next) => {
  const id = req.params.id;
  
  Blog.findById(id)
  .populate("labels")
  .then((blog) => {
      Comment.find({blog: id}).populate('user').then(comments => {
        res.render("blogs/details", { blog, title: "Blog Details", comments });
      })
    })
    .catch((err) => {
      next(err);
      res
        .status(404)
        .render("404", { title: "Blog not found", message: "Blog not found" });
    });
};

const blog_create_get = (req, res, next) => {
  errors = validationResult(req);
  BlogLabel.find()
    .then((labels) => {
      res.render("blogs/create", { title: "Create a new blog", labels });
    })
    .catch((err) => next(err));
};

const blog_create_post = (req, res, next) => {
  if (!req.cookies.jwt) {
    return res.redirect("/auth/login");
  }
  const blog = new Blog({...req.body, createdBy: res.locals.user._id});
  const labels = req.body.label; // output: can be a string of label or list of labels
  let labelsList = [];
  if (typeof labels === "string") {
    labelsList.push(labels);
  } else if (typeof labels === "object") {
    labelsList = labels;
  }
  User.findByIdAndUpdate(res.locals.user._id, { $push: { blogs: blog._id } })
    .then(
      blog
        .save()
        .then((result) => {
          labelsList.forEach((labelId) => {
            Blog.findByIdAndUpdate(
              result._id,
              { $push: { labels: labelId } },
              { new: true }
            ).catch((err) => next(err));
          });
          res.redirect("/blogs");
        })
        .catch((err) => next(err))
    )
    .catch((err) => next(err));
};

const blog_delete = (req, res, next) => {
  // TODO: Check if it is current user's blog before deleting it
  const id = req.params.id;

  Blog.findByIdAndDelete(id)
    .then(() => {
      res.json({ redirect: "/blogs" });
    })
    .catch((err) => next(err));
};

const blog_add_comment = (req, res, next) => {
  const blog_id = req.params.id;

  Blog.findById(blog_id).then(blog => {
    const comment = new Comment({...req.body, ...{user: res.locals.user._id, blog: blog._id}});
    User.findByIdAndUpdate(res.locals.user._id, {
      $push: { comments: comment._id },
    })
      .then(
        Blog.findByIdAndUpdate(
          blog_id,
          {
            $push: { comments: comment._id },
          },
          { new: true }
        )
          .then(() => {
            comment
              .save()
              .then(() => {
                return res.redirect(req.originalUrl);
              })
              .catch((err) => next(err));
          })
          .catch((err) => next(err))
      )
      .catch((err) => next(err));
  })
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete,
  blog_add_comment,
};
