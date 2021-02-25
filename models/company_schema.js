let mongoose = require('mongoose');

// company Schema
let companySchema = mongoose.Schema({
    com_name: {
        type: String,
    },
    sdate: {
        type: Date,
    },
    edate: {
        type: Date,
    },
    mast_nm: {
        type: String,
    },
    Dealer_miscsno: {
        type: String,
    },
    Q_T_K: {
        type: String,
    },
});

module.exports = mongoose.model('div_com', companySchema);
