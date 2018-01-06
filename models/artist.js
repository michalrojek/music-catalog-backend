let mongoose = require('mongoose');

let artistSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    surname:{
        type: String
    },
    birthDate:{
        type: String,
    },
    birthPlace:{
        type: String,
    },
    type:{
        type: String,
    },
    genres:{
        type: Array,
    },
    origin:{
        type: String,
    }
});

let Artist = module.exports = mongoose.model('Artist', artistSchema);