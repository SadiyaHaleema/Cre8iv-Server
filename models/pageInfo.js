
const mongoose = require('mongoose');

const pageinfoschema = new mongoose.Schema({
    pageId: { type: String, unique: true },
    // fbuserid: String,
    // fbusername: String,
    category: String,
    username: String,
    biography: String,
    keywords:{type:Array, default:null}
   
    // Add any other fields related to page info
  });
  
  pageinfoschema.add({
    imgText:[String],
    imgObj:[String],
    
  });
  
  const pageinfo = mongoose.model('pageinfo', pageinfoschema);
  
  module.exports ={pageinfo:pageinfo};
  