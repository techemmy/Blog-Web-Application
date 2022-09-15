const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const BlogSchema = new Schema(
  {
    // A Schema describes what our model should look like
    title: {
      type: String,
      required: [true, "A title is required"],
    },
    snippet: {
      type: String,
      required: [true, "Snippet is required!"],
    },
    body: {
      type: String,
      required: [true, "Body is required!"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlogLabel",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

BlogSchema.pre("save", function (next) {
  let { snippet } = this;
  if (snippet.length > 50) {
    this.snippet = snippet.substring(0, 50);
  }
  next();
});

const Blog = mongoose.model("Blog", BlogSchema); // the model object now provides us with more functionalities

module.exports = Blog;
