const express = require('express');
const router = express.Router();

let Edition = require('../models/edition');

router.get('/all/:page', function(req, res) {
    if (!isNaN(parseInt(req.params.page))) {
        let editionOffset = parseInt(req.params.page) * 5 - 5;
        console.log(parseInt(req.params.page));
        Edition.find({}).limit(5).skip(editionOffset).exec(function(err, editions) {
            if (err) {
                console.error('/editions/all/:page error: ' + err);
            } else {
                Edition.count({}, function(countErr, count) {
                    if (countErr) {
                        console.error('/editions/all/:page count error: ' + countErr);
                    } else {
                        res.status(200).json({
                            "editionCount" : count,
                            "editions" : editions
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
    Edition.find({}).exec(function(err, editions) {
        if (err) {
            console.error('/editions/all error: ' + err);
        } else {
            Edition.count({}, function(countErr, count) {
                if (countErr) {
                    console.error('/editions/all count error: ' + countErr);
                } else {
                    res.status(200).json({
                        "editionCount" : count,
                        "editions" : editions
                    });
                }
            });
        }
    });
});

router.get('/search/query', function(req, res) {
    if (!isNaN(parseInt(req.query.page))) {
        let editionOffset = parseInt(req.query.page) * 5 - 5;
        let myRegex = new RegExp('.*' + req.query.searchEdition + '.*', 'g');
        console.log(myRegex);
        Edition.find({name: {$regex : myRegex, $options: 'i'}}).limit(5).skip(editionOffset).exec(function(err, editions) {
            if (err) {
                console.error('/editions/search/query error: ' + err);
            } else {
                Edition.count({name: {$regex : myRegex, $options: 'i'}}, function(countErr, count) {
                    if (countErr) {
                        console.error('/editions/search/query count error: ' + countErr);
                    } else {
                        res.status(200).json({
                            "editionCount" : count,
                            "editions" : editions
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
    Edition.findById(req.params.id, function(err, edition) {
        if (err) {
            res.status(200).json({
                "failureMessage" : "Nie znaleziono wydania albumu"
            });
        } else {
            res.status(200).json({
                edition
            });
        }
    });
});

router.post('/addEdition', function(req, res) {
    req.checkBody('editionName', 'Nazwa wydania albumu jest wymagana.').notEmpty();
    req.checkBody('editionName', 'Nazwa wydania albumu może składać się jedynie z liter.').isAlpha();
    req.checkBody('editionDescription', 'Opis wydania albumu jest wymagany.').notEmpty();
    
    let errors = req.validationErrors();

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        Edition.findOne({name: req.body.editionName}, function(err, edition) {
            if(err) {
                console.error('/edition/addEdition error: ' + err);
            } else if (edition) {
                res.status(200).json({
                    "failureMessage" : "Takie wydanie albumu znajduje się już w bazie danych."
                });
            } else if (!edition) {
                let newEdition = new Edition();
                newEdition.name = req.body.editionName;
                newEdition.description = req.body.editionDescription;

                newEdition.save(function(err) {
                    if (err) {
                        console.error('/edition/addEdition error: ' + err);
                    } else {
                        res.status(200).json({
                            "successMessage" : "Pomyślnie dodano wydanie albumu."
                        });
                    }
                });
            }
        })
    }
});

router.post('/editEdition/:id', function(req, res) {
    req.checkBody('editionName', 'Nazwa wydania albumu jest wymagana.').notEmpty();
    req.checkBody('editionName', 'Nazwa wydania albumu może składać się jedynie z liter.').isAlpha();
    req.checkBody('editionDescription', 'Opis wydania albumu jest wymagany.').notEmpty();
    
    let errors = req.validationErrors();

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        Edition.findOne({name: req.body.editionName, _id: {$not: {$eq:req.params.id}}}, function(err, edition) {
            if(err) {
                console.error('/edition/addEdition error: ' + err);
            } else if (edition) {
                res.status(200).json({
                    "failureMessage" : "Takie wydanie albumu znajduje się już w bazie danych."
                });
            } else if (!edition) {
                let newEdition = {};
                newEdition.name = req.body.editionName;
                newEdition.description = req.body.editionDescription;

                newEdition.findByIdAndUpdate(req.params.editionName, newEdition, function(err) {
                    if (err) {
                        console.error('/edition/addEdition error: ' + err);
                    } else {
                        res.status(200).json({
                            "successMessage" : "Pomyślnie edytowano wydanie albumu."
                        });
                    }
                });
            }
        })
    }
});

module.exports = router;