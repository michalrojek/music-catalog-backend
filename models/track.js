let mongoose = require('mongoose');

let trackSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    duration:{
        type: Number,
        required: true
    },
    trackNumber:{
        type: Number,
        required: true
    },
    discNumber:{
        type: Number,
        required: true
    },
    idAlbum:{
        type: String,
        required: true
    }
});

let Track = module.exports = mongoose.model('Track', trackSchema);