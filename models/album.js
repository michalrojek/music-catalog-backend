
let mongoose = require('mongoose');

let albumSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    releaseDate:{
        type: String
    },
    length:{
        type: String
    },
    tracks:{
        type: Array
    },
    idArtist:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    idAlbumType:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    idGenres:{
        type: Array
    },
    idEditions:{
        type: Array
    }
});

let Album = module.exports = mongoose.model('Album', albumSchema);