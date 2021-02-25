let mongoose = require('mongoose');

// Brand Schema
let masterSchema = mongoose.Schema({
    custname: {
        type: String,
    },
},{
    collection: 'masterSchema'
});
 module.exports = mongoose.model('masterSchema', masterSchema);