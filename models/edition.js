let mongoose = require('mongoose');

let editionSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    }
});

let Edition = module.exports = mongoose.model('Edition', editionSchema);