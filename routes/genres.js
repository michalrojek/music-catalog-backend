const express = require('express');
const router = express.Router();

let Genre = require('../models/genre');

router.get('/all/:page', function(req, res) {
    if (!isNaN(parseInt(req.params.page))) {
        let genreOffset = parseInt(req.params.page) * 5 - 5;
        console.log(parseInt(req.params.page));
        Genre.find({}).limit(5).skip(genreOffset).exec(function(err, genres) {
            if (err) {
                console.error('/genres/all/:page error: ' + err);
            } else {
                Genre.count({}, function(countErr, count) {
                    if (countErr) {
                        console.error('/genres/all/:page count error: ' + countErr);
                    } else {
                        res.status(200).json({
                            "genreCount" : count,
                            "genres" : genres
                        });
                    }
                });
            }
        });
    } else {
        res.status(200).json({
            message: "Podano zły paramter!"
        });
    }
});

router.get('/all', function(req, res) {
    Genre.find({}).exec(function(err, genres) {
        if (err) {
            console.error('/genres/all error: ' + err);
        } else {
            Genre.count({}, function(countErr, count) {
                if (countErr) {
                    console.error('/genres/all count error: ' + countErr);
                } else {
                    res.status(200).json({
                        "genreCount" : count,
                        "genres" : genres
                    });
                }
            });
        }
    });
});

router.get('/search/query', function(req, res) {
    if (!isNaN(parseInt(req.query.page))) {
        let genreOffset = parseInt(req.query.page) * 5 - 5;
        let myRegex = new RegExp('.*' + req.query.searchGenre + '.*', 'g');
        console.log(myRegex);
        Genre.find({name: {$regex : myRegex, $options: 'i'}}).limit(5).skip(genreOffset).exec(function(err, genres) {
            if (err) {
                console.error('/genres/search/query error: ' + err);
            } else {
                Genre.count({name: {$regex : myRegex, $options: 'i'}}, function(countErr, count) {
                    if (countErr) {
                        console.error('/genres/search/query count error: ' + countErr);
                    } else {
                        res.status(200).json({
                            "genresCount" : count,
                            "genres" : genres
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
    Genre.findById(req.params.id, function(err, genre) {
        if (err) {
            res.status(200).json({
                "failureMessage" : "Nie znaleziono gatunku"
            });
        } else {
            res.status(200).json({
                genre
            });
        }
    });
});

router.post('/addGenre', function(req, res) {
    req.checkBody('genreName', 'Nazwa gatunku jest wymagana.').notEmpty();
    req.checkBody('genreName', 'Nazwa gatunku może składać się jedynie z liter.').isAlpha();
    req.checkBody('genreDescription', 'Opis gatunku jets wymagany.').notEmpty();
    
    let errors = req.validationErrors();

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        Genre.findOne({name: req.body.genreName}, function(err, genre) {
            if(err) {
                console.error('/genre/addGenre error: ' + err);
            } else if (genre) {
                res.status(200).json({
                    "failureMessage" : "Taki gatunek znajduje się już w bazie danych."
                });
            } else if (!genre) {
                let newGenre = new Genre();
                newGenre.name = req.body.genreName;
                newGenre.description = req.body.genreDescription;

                newGenre.save(function(err) {
                    if (err) {
                        console.error('/genre/addGenre error: ' + err);
                    } else {
                        res.status(200).json({
                            "successMessage" : "Pomyślnie dodano gatunek."
                        });
                    }
                });
            }
        })
    }
});

router.post('/editGenre/:id', function(req, res) {
    req.checkBody('genreName', 'Nazwa gatunku jest wymagana.').notEmpty();
    req.checkBody('genreName', 'Nazwa gatunku może składać się jedynie z liter.').isAlpha();
    req.checkBody('genreDescription', 'Opis gatunku jets wymagany.').notEmpty();
    
    let errors = req.validationErrors();

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        Genre.findOne({name: req.body.genreName, _id: {$not: {$eq:req.params.id}}}, function(err, genre) {
            if(err) {
                console.error('/genre/addGenre error: ' + err);
            } else if (genre) {
                res.status(200).json({
                    "failureMessage" : "Taki gatunek znajduje się już w bazie danych."
                });
            } else if (!genre) {
                let newGenre = {};
                newGenre.name = req.body.genreName;
                newGenre.description = req.body.genreDescription;

                newGenre.findByIdAndUpdate(req.params.genreName, newGenre, function(err) {
                    if (err) {
                        console.error('/genre/addGenre error: ' + err);
                    } else {
                        res.status(200).json({
                            "successMessage" : "Pomyślnie edytowano gatunek."
                        });
                    }
                });
            }
        })
    }
});

module.exports = router;