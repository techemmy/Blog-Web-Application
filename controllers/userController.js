const mongoose = require("mongoose");
const User = require("../models/user");
const Comment = require("../models/comment")
const {
  renderFeedbackMessage,
} = require("../helperFunctions");
const bcrypt = require("bcryptjs");
const { render } = require("ejs");

// user_profile_get, edit_profile_get, edit_profile_post, user_comments, upload_profile_image_post

const profileImagePath = "/uploads/images"

const user_profile_get = (req, res, next) => {
  if (!req.params.id) {
    return next();
  }
  const isCurrentUser = req.params.id == res.locals.user.id;
  if (!isCurrentUser) {
    User.findById(req.params.id)
      .then((currentUser) => {
        res.render("./user/profile", {
          title: "Profile Details",
          isCurrentUser,
          currentUser,
          profileImagePath
        });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.render("./user/profile", {
      title: "Profile Details",
      isCurrentUser,
      currentUser: res.locals.user,
      profileImagePath
    });
  }
};

const edit_profile_get = (req, res) => {
  res.render("./user/edit-profile", { title: "Edit Profile" });
};

const edit_profile_post = (req, res, next) => {
  const { username, oldPassword, newPassword } = req.body;
  console.log("Req: ", req.body);

  if (
    (oldPassword && !newPassword) ||                           // if old password field is field and new password field is not OR
    (oldPassword && newPassword && oldPassword == newPassword) // the fields are filled but they are the same
  ) {
    return renderFeedbackMessage(
      res,
      "./user/edit-profile",
      "Edit Profile",
      [
        "Check your passwords input and try again!",
      ],
      res.locals.user,
      "danger"
    );
  }

  if (username && username != res.locals.username) {
    User.findByIdAndUpdate(res.locals.user._id, { username })
    .then(() => {
      return res.redirect(req.originalUrl);
    }).catch((err) =>
      next(err)
    );
  }

  if (oldPassword && newPassword && !(oldPassword == newPassword)) {
    bcrypt
      .compare(oldPassword, res.locals.user.password)
      .then((result) => {
        if (result) {
          const password = bcrypt.hashSync(newPassword, 10);
          User.findByIdAndUpdate(res.locals.user._id, { password })
            .then(() => {
              return renderFeedbackMessage(
                res,
                "./user/edit-profile",
                "Edit Profile",
                ["Password Updated Succesfully!"],
                res.locals.user,
                "success"
              );
            })
            .catch((err) => next(err));
        } else {
          return renderFeedbackMessage(
            res,
            "./user/edit-profile",
            "Edit Profile",
            ["Passwords do not match!"],
            res.locals.user,
            "danger"
          );
        }
      })
      .catch((err) => next(err));
  }
};

const user_comments_get = (req, res, next) => {
  Comment.find({user: res.locals.user._id}).populate('user').populate('blog')
  .then(comments => {
    res.render('comment', {title: "My comments", comments})
  }).catch(err => next(err));
};

const upload_profile_image_post = (req, res, next) => {
  if (!req.file) {
    const isCurrentUser = req.params.id == res.locals.user.id;
    return renderFeedbackMessage(res, './user/profile', "Profile Details", ["Choose a file."], res.locals.user, "danger",
    {
      isCurrentUser,
      currentUser: res.locals.user,
      profileImagePath
    })
  }

  User.findByIdAndUpdate(res.locals.user._id, {profileImagePath: req.file.filename})
  .then(() => {
    res.redirect(`/user/${res.locals.user._id}`);
  })
  .catch(err => next(err));
}

module.exports = {
  user_profile_get,
  edit_profile_get,
  edit_profile_post,
  user_comments_get,
  upload_profile_image_post
};
