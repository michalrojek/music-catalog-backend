let mongoose = require('mongoose');

let bandSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    genres:{
        type: Array,
    },
    origin:{
        type: String,
    },
    members:{
        type: Array
    },
    formDate:{
        type: Number
    }
});

let Band = module.exports = mongoose.model('Band', bandSchema);