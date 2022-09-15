const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImagePath : {
    type: String,
    default: null
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

UserSchema.pre("save", function (next) {
  // Encrypt user password
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
