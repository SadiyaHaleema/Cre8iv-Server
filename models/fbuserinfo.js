
const mongoose = require('mongoose');

const fbuserinfoschema = new mongoose.Schema({
    fbuserId: { type: String, unique: true },
    fbuser_name: String,
    fbpageids: [String],
    fbpagenames: [String]
    // Add any other fields related to page info
  });
  
   const fbuserinfo = mongoose.model('fbuserinfo', fbuserinfoschema);
  
  module.exports ={fbuserinfo};
  