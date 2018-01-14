let mongoose = require('mongoose');

let genreSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    }
});

let Genre = module.exports = mongoose.model('Genre', genreSchema);