const mongoose = require('mongoose');

const pageinfoschema = new mongoose.Schema({
  userId: { type: String, required: true }, // User ID field
  pageId: { type: String, required: true, unique: true }, // Instagram ID field with unique constraint
  user_name: String,
  category: String,
  insta_username: String,
  biography: String,
  keywords: { type: Array, default: null },

  // Add any other fields related to page info
});

pageinfoschema.add({
  imgText: [String],
  imgObj: [String],
});

// Create a compound index for fbuserId and pageId
pageinfoschema.index({ fbuserId: 1, pageId: 1 }, { unique: true });

const pageinfo = mongoose.model('pageinfo', pageinfoschema);

module.exports = { pageinfo: pageinfo };

//----------------------------------------------------

// const mongoose = require('mongoose');

// const pageinfoschema = new mongoose.Schema({
//   pageId: { type: String, unique: true },
//   // fbuserid: String,
//   // fbusername: String,
//   category: String,
//   username: String,
//   biography: String,
//   keywords: { type: Array, default: null },

//   // Add any other fields related to page info
// });

// pageinfoschema.add({
//   imgText: [String],
//   imgObj: [String],
// });

// const pageinfo = mongoose.model('pageinfo', pageinfoschema);

// module.exports = { pageinfo: pageinfo };
