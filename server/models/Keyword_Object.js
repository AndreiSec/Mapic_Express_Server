const { isValidObjectId } = require('mongoose');

const mongoose = require('mongoose');


const KeywordSchema = new mongoose.Schema({
//     post_ID:{
//       type: String,
//       default: ''
//   },
keyword:{
    type: String,
    default: ''
},

post_array:[{
    type: String
}],



});

module.exports = mongoose.model('Keyword_Object', KeywordSchema);