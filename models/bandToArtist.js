let mongoose = require('mongoose');

let bandToArtistSchema = mongoose.Schema({
    idBand:{
        type: String,
        required: true
    },
    idArtist:{
        type: String,
        required: true
    },
    startYear:{
        type: Number
    },
    endYear:{
        type: Number
    }
});

let BandToArtist = module.exports = mongoose.model('BandToArtist', bandToArtistSchema);