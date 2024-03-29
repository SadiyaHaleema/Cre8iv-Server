
const mongoose = require('mongoose');
const postschema = new mongoose.Schema({
  instaPageId: { type: String, ref: 'pageinfo' }, // Foreign key reference
  postid : { type: String, unique: true },
  captionText: String,
  mediaurl: String,
  timestamp: Date,

  // Add any other fields related to captions
});

const post = mongoose.model('post', postschema);

module.exports = post;
