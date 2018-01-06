const express = require('express');
const router = express.Router();

let Artist = require('../models/artist');

router.get('/all/:page', function(req, res) {
    if (!isNaN(parseInt(req.params.page))) {
        let artistOffset = parseInt(req.params.page) * 5 - 5;
        console.log(parseInt(req.params.page));
        Artist.find({}).limit(5).skip(artistOffset).exec(function(err, artists) {
            if (err) {
                console.error('/artist/all/:page error: ' + err);
            } else {
                Artist.count({}, function(countErr, count) {
                    if (countErr) {
                        console.error('/artist/all/:page count error: ' + countErr);
                    } else {
                        res.status(200).json({
                            "artistCount" : count,
                            "artists" : artists
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

router.get('/search/query', function(req, res) {
    if (!isNaN(parseInt(req.query.page))) {
        let artistOffset = parseInt(req.query.page) * 5 - 5;
        //console.log(parseInt(req.params.page));
        let myRegex = new RegExp('.*' + req.query.searchArtist + '.*', 'g');
        console.log(myRegex);
        Artist.find({name: {$regex : myRegex, $options: 'i'}}).limit(5).skip(artistOffset).exec(function(err, artists) {
            if (err) {
                console.error('/artist/search/query error: ' + err);
            } else {
                Artist.count({name: {$regex : myRegex, $options: 'i'}}, function(countErr, count) {
                    if (countErr) {
                        console.error('/artist/search/query count error: ' + countErr);
                    } else {
                        res.status(200).json({
                            "artistCount" : count,
                            "artists" : artists
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
    Artist.findById(req.params.id, function(err, artist) {
        if (err) {
            res.status(200).json({
                "failureMessage" : "Nie znaleziono artysty"
            });
        } else {
            res.status(200).json({
                artist
            });
        }
    });
});

router.post('/addArtist', function(req, res) {
    req.checkBody('artistName', 'Imię artysty jest wymagane.').notEmpty();
    req.checkBody('artistName', 'Imię artysty może składać się jedynie z liter.').isAlpha();
    req.checkBody('artistSurname', 'Nazwisko artysty jest wymagane.').notEmpty();
    req.checkBody('artistSurname', 'Nazwisko artysty może składać się jedynie z liter.').isAlpha();
    req.checkBody('artistCountry', 'Kraj pochodzenia artysty jest wymagany.').notEmpty();
    req.checkBody('artistCountry', 'Kraj pochodzenia artysty może składać się jedynie z liter.').isAlpha();
    req.checkBody('artistBirth', 'Data urodzenia artysty jest wymagana.').notEmpty();
    req.checkBody('artistBirth', 'Datę urodzenia artysty należy podać w odpowiednim formacie.').isISO8601();
    
    let errors = req.validationErrors();

    if((new Date(req.body.artistBirth).getTime()>new Date().getTime())) {
        var error = {param: 'artistBirth', msg: 'Data urodzenia artysty nie może być z przyszłości.'};
        if(!errors) {
            errors = [];
        }
        errors.push(error);
    }

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        let newArtist = new Artist();
        newArtist.name = req.body.artistName;
        newArtist.surname = req.body.artistSurname;
        newArtist.birthPlace = req.body.artistCountry;
        newArtist.birthDate = req.body.artistBirth;

        newArtist.save(function(err) {
            if (err) {
                console.error('/artist/addArtist error: ' + err);
            } else {
                console.log(newArtist.surname);
                res.status(200).json({
                    "successMessage" : "Pomyślnie dodano artystę."
                });
            }
        });
    }
});

router.post('/editArtist/:id', function(req, res) {
    req.checkBody('artistName', 'Imię artysty jest wymagane.').notEmpty();
    req.checkBody('artistName', 'Imię artysty może składać się jedynie z liter.').isAlpha();
    req.checkBody('artistSurname', 'Nazwisko artysty jest wymagane.').notEmpty();
    req.checkBody('artistSurname', 'Nazwisko artysty może składać się jedynie z liter.').isAlpha();
    req.checkBody('artistCountry', 'Kraj pochodzenia artysty jest wymagany.').notEmpty();
    req.checkBody('artistCountry', 'Kraj pochodzenia artysty może składać się jedynie z liter.').isAlpha();
    req.checkBody('artistBirth', 'Data urodzenia artysty jest wymagana.').notEmpty();
    req.checkBody('artistBirth', 'Datę urodzenia artysty należy podać w odpowiednim formacie.').isISO8601();
    
    let errors = req.validationErrors();

    if((new Date(req.body.artistBirth).getTime()>new Date().getTime())) {
        var error = {param: 'artistBirth', msg: 'Data urodzenia artysty nie może być z przyszłości.'};
        if(!errors) {
            errors = [];
        }
        errors.push(error);
    }

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        let newArtist = {};
        newArtist.name = req.body.artistName;
        newArtist.surname = req.body.artistSurname;
        newArtist.birthPlace = req.body.artistCountry;
        newArtist.birthDate = req.body.artistBirth;
        Artist.findByIdAndUpdate(req.params.id, newArtist, function(err) {
            if (err) {
                console.error('/artist/addArtist error: ' + err);
            } else {
                console.log(newArtist.surname);
                res.status(200).json({
                    "successMessage" : "Pomyślnie edytowano dane artysty."
                });
            }
        });
    }
});

router.delete('/id/:id', function(req, res) {
    Artist.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.error('/artist/id/:id delete error: ' + err);
            res.status(200).json({
                "failureMessage" : "Błąd usuwania artysty."
            })
        } else {
            res.status(200).json({
                "successMessage" : "Artysta usunięty pomyślnie."
            });
        }
    });
});

module.exports = router;