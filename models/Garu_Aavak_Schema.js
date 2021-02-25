let mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Add Detailes
// var addamt = new Schema({ 
//     particular_add  : {
//         type: Schema.Types.ObjectId, ref:'addless_mast'
//     },
//     particular_amount  :  Number,
//     id :Schema.Types.ObjectId });

var addamt = new Schema({
    particular_add: {
        type: Schema.Types.ObjectId, ref: 'Add_Less_Parameter_Master_Schema'
    },
    Index: Number,
    add_Desription: {
        type: String
    },
    particular_amount: Number,
    id: Schema.Types.ObjectId
});

// Less Detailes
// var lessamt = new Schema({ 
//     particular_less  : {
//        type: Schema.Types.ObjectId, ref:'addless_mast'
//     },
//     particular_amtless  :  Number ,
//     id :Schema.Types.ObjectId });
var lessamt = new Schema({
    particular_less: {
        type: Schema.Types.ObjectId, ref: 'Add_Less_Parameter_Master_Schema'
    },
    less_Desription: {
        type: String
    },
    Index: Number,
    particular_amtless: Number,
    id: Schema.Types.ObjectId
});

// Garu Aavak Group    
var garu_Aavak_Group = new Schema({
    gdn_Cd_Name: {
        type: Schema.Types.ObjectId, ref: 'gowdawnCodeSchema',
    },
    lot_No: {
        type: String,
    },
    item_Code_Desc: {
        type: Schema.Types.ObjectId, ref: 'fgSchema',
    },
    brand: {
        type: Schema.Types.ObjectId, ref: 'brandSchema',
    },
    purchase_Ac_Title: {
        type: Schema.Types.ObjectId, ref: 'accountSchema',
    },
    sale_Ac_Title: {
        type: Schema.Types.ObjectId, ref: 'accountSchema',
    },
    unit: {
        type: Schema.Types.ObjectId, ref: 'skuSchema',
    },
    marks: String,
    qntty: Number,
    qty_blc: String,
    qty_exe: String,
    pkng: Number,
    net_Wt: Number,
    rate: Number,
    QW: String,
    amount: Number,
    discount: Number,
    Dis_Amt: String,
    bardan_Gross_Amount: Number,
    apmc: String,
    apmc_Amount: Number,
    ec: String,
    entry_Tax: String,
    tax_Code: String,
    tax_Amt: String,
    GST: String,
    net_Amount: Number,
    vakal_Thok: String,
    dana_Rt: Number,
    minStkQty: Number,
    reOrderQty: Number,
    maxStkQty: Number,
    masterPack: Number,
    Item_IGST: Number,
    Item_CGST: Number,
    Item_SGST: Number,
    id: Schema.Types.ObjectId
});

// Main Schema
let Garu_Aavak_Schema = mongoose.Schema({
    main_bk: {
        type: String,
    },
    d_c: {
        type: String,
    },
    c_j_s_p: {
        type: String,
    },
    vouc_code: {
        type: Number,
    },
    gdn_Name: {
        type: Schema.Types.ObjectId, ref: 'gowdawnCodeSchema',
    },
    item_group: {
        type: Schema.Types.ObjectId, ref: 'CategorySchema',
    },
    subquality: {
        type: Schema.Types.ObjectId, ref: 'subqualitySchema',
    },
    entry_Date: {
        type: Date,
    },
    entry_Datemilisecond: {
        type: Number,
    },

    bill_Date: {
        type: Date,
    },
    do_No: {
        type: String,
    },
    do_Date: {
        type: Date,
    },
    do_Datemilisecond: {
        type: Number,
    },
    po_No: {
        type: String,
    },
    po_Date: {
        type: Date,
    },
    po_Datemilisecond: {
        type: Number,
    },
    bill_No: {
        type: String,
    },
    bill_Datemilisecond: {
        type: Number,
    },
    cr_Days: {
        type: String,
    },
    due_On: {
        type: String,
    },
    lorry_Wagon_No: {
        type: String,
    },
    party_Code: {
        type: Schema.Types.ObjectId, ref: 'accountSchema',
    },
    broker_Code: {
        type: Schema.Types.ObjectId, ref: 'accountSchema',
    },
    sl_Person: {
        type: Schema.Types.ObjectId, ref: 'accountSchema',
    },

    //AkshatDalke

    transport: {
        type: String,
    },
    vehicle: {
        type: String,
    },
    driver: {
        type: String,
    },
    mobile: {
        type: String,
    },




    
    Outstanding_Arr: {
        type: String,
    },
    garu_Remarks: {
        type: String,
    },
    tot_Qty: {
        type: Number,
    },
    tot_weight: {
        type: Number,
    },
    tot_Amt: {
        type: Number,
    },
    tot_AmtBeforeDis: {
        type: Number
    },
    tot_DisAmt: {
        type: Number,
    },
    tot_TaxAmt: {
        type: Number
    },
    tot_APMCAMT: {
        type: Number
    },
    tot_AmtBeforeTax: {
        type: Number
    },
    gst_TaxAmtTot5: {
        type: Number,
    },
    gst_TaxAmtTot12: {
        type: Number,
    },
    gst_TaxAmtTot18: {
        type: Number,
    },
    gross_Amt: {
        type: Number,
    },
    cashCredit: {
        type: String,
    },
    co_code: {
        type: String,
    },
    div_code: {
        type: String,
    },
    usrnm: {
        type: String,
    },
    masterid: {
        type: String,
    },
    flag: {
        type: String,
    },
    del: {
        type: String,
    },
    entrydate: {
        type: String,
    },
    update: {
        type: String,
    },
    delete: {
        type: String,
    },
    garu_Aavak_Group: [garu_Aavak_Group],
    add_details: [addamt],
    less_details: [lessamt],
    Item_Detail: {
        type: Array,
    },
    add_Total: {
        type: String,
    },
    less_Total: {
        type: String,
    },
    Item_Total: {
        type: String,
    },
    Gst_Total: {
        type: String,
    },
    SB_haste: {
        type: String,
    },
    // Tax Voucher
    Deductee: {
        type: Schema.Types.ObjectId, ref: 'accountSchema',
    },
    ExpenseAc: {
        type: Schema.Types.ObjectId, ref: 'accountSchema',
    },
    HSN_SAC: {
        type: String,
    },
    GSTIN: {
        type: String,
    },
    cash_bank_name: {
        type: Schema.Types.ObjectId, ref: 'accountSchema',
    },
    Basic_Amt: {
        type: String,
    },
    TDS_On: String,
    ITC: {
        type: String,
    },
    Tax_Type: {
        type: Schema.Types.ObjectId, ref: 'taxSchema',
    },
    TDS_Per: {
        type: String,
    },
    TDS_Amt: {
        type: Number,
    },
    GST_Per: {
        type: String,
    },
    Narration: {
        type: String,
    },
    trans_id: [{ type: Schema.Types.ObjectId, ref: 'trans' }],
    trans_id_CB: { type: Schema.Types.ObjectId, ref: 'trans' },
    challan_no: {
        type: String,
    },
    challan_date: {
        type: Date,
    },
    challan_date_Milisecend: {
        type: Number,
    },
    Bank: {
        type: Schema.Types.ObjectId, ref: 'accountSchema',
    },
    BSR_Code: {
        type: String,
    },
    Chq_No: {
        type: String,
    },
    Chq_Date: {
        type: String,
    },
    Selected_Amt_Of_Bills: {
        type: String,
    },
    source_Warehouse: {
        type: Schema.Types.ObjectId, ref: 'gowdawnCodeSchema',
    },
    destination_warehouse: {
        type: Schema.Types.ObjectId, ref: 'gowdawnCodeSchema',
    },
    CNCL: String,
    CNCL_Time: Date,
}, {
        collection: 'Garu_Aavak_Schema'
    });

module.exports = mongoose.model('Garu_Aavak_Schema', Garu_Aavak_Schema);


