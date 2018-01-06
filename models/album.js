let mongoose = require('mongoose');

let albumSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    releaseDate:{
        type: String
    },
    idArtist:{
        type: String,
        required: true
    }
});

let Album = module.exports = mongoose.model('Album', albumSchema);