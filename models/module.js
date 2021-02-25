const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let moduleSchema = new Schema({
   ModuleName: {
      type: String,
   },
   prdpst: {
      type: String,
   },
   prdstp: {
      type: String,
   }
   },{
      collection: 'moduleSchema'
  });

module.exports = mongoose.model('moduleSchema', moduleSchema);