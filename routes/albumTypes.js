const express = require('express');
const router = express.Router();

let AlbumType = require('../models/albumType');

router.get('/all/:page', function(req, res) {
    if (!isNaN(parseInt(req.params.page))) {
        let albumTypeOffset = parseInt(req.params.page) * 5 - 5;
        console.log(parseInt(req.params.page));
        AlbumType.find({}).limit(5).skip(albumTypeOffset).exec(function(err, albumTypes) {
            if (err) {
                console.error('/albumTypes/all/:page error: ' + err);
            } else {
                AlbumType.count({}, function(countErr, count) {
                    if (countErr) {
                        console.error('/albumTypes/all/:page count error: ' + countErr);
                    } else {
                        res.status(200).json({
                            "albumTypeCount" : count,
                            "albumTypes" : albumTypes
                        });
                    }
                });
            }
        });
    } else {
        res.status(200).json({
            message: "Podano zły parametr!"
        });
    }
});

router.get('/all', function(req, res) {
    AlbumType.find({}).exec(function(err, albumTypes) {
        if (err) {
            console.error('/albumTypes/all error: ' + err);
        } else {
            AlbumType.count({}, function(countErr, count) {
                if (countErr) {
                    console.error('/albumTypes/all count error: ' + countErr);
                } else {
                    res.status(200).json({
                        "albumTypeCount" : count,
                        "albumTypes" : albumTypes
                    });
                }
            });
        }
    });
});

router.get('/search/query', function(req, res) {
    if (!isNaN(parseInt(req.query.page))) {
        let albumTypeOffset = parseInt(req.query.page) * 5 - 5;
        let myRegex = new RegExp('.*' + req.query.searchAlbumType + '.*', 'g');
        console.log(myRegex);
        AlbumType.find({name: {$regex : myRegex, $options: 'i'}}).limit(5).skip(albumTypeOffset).exec(function(err, albumTypes) {
            if (err) {
                console.error('/albumTypes/search/query error: ' + err);
            } else {
                AlbumType.count({name: {$regex : myRegex, $options: 'i'}}, function(countErr, count) {
                    if (countErr) {
                        console.error('/albumTypes/search/query count error: ' + countErr);
                    } else {
                        res.status(200).json({
                            "albumTypeCount" : count,
                            "albumTypes" : albumTypes
                        });
                    }
                });
            }
        });
    } else {
        res.status(200).json({
            message: "Ty chujuuu."
        });
    }
});

router.get('/id/:id', function(req, res) {
    AlbumType.findById(req.params.id, function(err, albumType) {
        if (err) {
            res.status(200).json({
                "failureMessage" : "Nie znaleziono typu albumu"
            });
        } else {
            res.status(200).json({
                albumType
            });
        }
    });
});

router.post('/addAlbumType', function(req, res) {
    req.checkBody('albumTypeName', 'Nazwa typu albumu jest wymagana.').notEmpty();
    req.checkBody('albumTypeName', 'Nazwa typu albumu może składać się jedynie z liter.').isAlpha();
    req.checkBody('albumTypeDescription', 'Opis typu albumu jest wymagany.').notEmpty();
    
    let errors = req.validationErrors();

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        AlbumType.findOne({name: req.body.albumTypeName}, function(err, albumType) {
            if(err) {
                console.error('/albumType/addAlbumType error: ' + err);
            } else if (albumType) {
                res.status(200).json({
                    "failureMessage" : "Taki typ albumu znajduje się już w bazie danych."
                });
            } else if (!albumType) {
                let newAlbumType = new AlbumType();
                newAlbumType.name = req.body.albumTypeName;
                newAlbumType.description = req.body.albumTypeDescription;

                newAlbumType.save(function(err) {
                    if (err) {
                        console.error('/albumType/addAlbumType error: ' + err);
                    } else {
                        res.status(200).json({
                            "successMessage" : "Pomyślnie dodano typ albumu."
                        });
                    }
                });
            }
        })
    }
});

router.post('/editAlbumType/:id', function(req, res) {
    req.checkBody('albumTypeName', 'Nazwa typu albumu jest wymagana.').notEmpty();
    req.checkBody('albumTypeName', 'Nazwa typu albumu może składać się jedynie z liter.').isAlpha();
    req.checkBody('albumTypeDescription', 'Opis typu albumu jest wymagany.').notEmpty();
    
    let errors = req.validationErrors();

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        AlbumType.findOne({name: req.body.albumTypeName, _id: {$not: {$eq:req.params.id}}}, function(err, albumType) {
            if(err) {
                console.error('/albumType/addAlbumType error: ' + err);
            } else if (albumType) {
                res.status(200).json({
                    "failureMessage" : "Taki typ albumu znajduje się już w bazie danych."
                });
            } else if (!albumType) {
                let newAlbumType = {};
                newAlbumType.name = req.body.albumTypeName;
                newAlbumType.description = req.body.albumTypeDescription;

                newAlbumType.findByIdAndUpdate(req.params.albumTypeName, newAlbumType, function(err) {
                    if (err) {
                        console.error('/albumType/addAlbumType error: ' + err);
                    } else {
                        res.status(200).json({
                            "successMessage" : "Pomyślnie edytowano typ albumu."
                        });
                    }
                });
            }
        })
    }
});

module.exports = router;