let mongoose = require('mongoose');

let albumTypeSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    }
});

let AlbumType = module.exports = mongoose.model('AlbumType', albumTypeSchema);