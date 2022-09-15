const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    'comment': {
        type: String,
        required: true
    },
    'blog': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    },
    'user': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})

const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment;
