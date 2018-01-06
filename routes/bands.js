const express = require('express');
const router = express.Router();

let Band = require('../models/band');
let Artist = require('../models/artist');
let BandToArtist = require('../models/bandToArtist');

router.get('/all/:page', function(req, res) {
    if (!isNaN(parseInt(req.params.page))) {
        let bandOffset = parseInt(req.params.page) * 5 - 5;
        console.log(parseInt(req.params.page));
        Band.find({}).limit(5).skip(bandOffset).exec(function(err, bands) {
            if (err) {
                console.error('/band/all/:page error: ' + err);
            } else {
                Band.count({}, function(countErr, count) {
                    if (countErr) {
                        console.error('/band/all/:page count error: ' + countErr);
                    } else {
                        Promise.all(
                            bands.map(function(band, index) {
                                return new Promise(function(res){
                                    BandToArtist.find({idBand: band._id}, function (err, bandToArtists) {
                                        if (err) {
                                            console.error(err);
                                            res(1);
                                        } else {
                                            Promise.all(
                                                bandToArtists.map(function(bandToArtist, index) {
                                                    return new Promise(function(res){
                                                        Artist.findById(bandToArtist.idArtist, function (err, artist) {
                                                            if (err) {
                                                                console.error(err);
                                                                res(1);
                                                            } else {
                                                                let artistWithYears = {startYear:0, endYear:0};
                                                                for(var k in artist) artistWithYears[k]=artist[k];
                                                                artistWithYears['startYear'] = bandToArtist.startYear;
                                                                artistWithYears['endYear'] = bandToArtist.endYear;
                                                                console.log(artistWithYears);
                                                                res(artist);
                                                            }
                                                        });
                                                    });
                                                })
                                               ).then(function(wholeData){
                                                    bands[index].members = wholeData;
                                                    res({bandId: band._id, bandToArtists: bandToArtists, artist: wholeData});
                                                });
                                        }
                                    });
                                });
                            })
                           ).then(function(wholeData){
                                res.status(200).json({
                                    "bandCount" : count,
                                    "bands" : bands
                                });
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
        let bandOffset = parseInt(req.query.page) * 5 - 5;
        //console.log(parseInt(req.params.page));
        let myRegex = new RegExp('.*' + req.query.searchBand + '.*', 'g');
        console.log(myRegex);
        Band.find({name: {$regex : myRegex, $options: 'i'}}).limit(5).skip(bandOffset).exec(function(err, bands) {
            if (err) {
                console.error('/band/search/query error: ' + err);
            } else {
                Band.count({name: {$regex : myRegex, $options: 'i'}}, function(countErr, count) {
                    if (countErr) {
                        console.error('/band/search/query count error: ' + countErr);
                    } else {
                        res.status(200).json({
                            "bandCount" : count,
                            "bands" : bands
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
    Band.findById(req.params.id, function(err, band) {
        if (err) {
            res.status(200).json({
                "failureMessage" : "Nie znaleziono zespołu"
            });
        } else {
            res.status(200).json({
                band
            });
        }
    });
});

router.post('/addBand', function(req, res) {
    req.checkBody('bandName', 'Nazwa zespołu jest wymagana.').notEmpty();
    req.checkBody('bandOrigin', 'Kraj pochodzenia zespołu jest wymagany.').notEmpty();
    req.checkBody('bandOrigin', 'Kraj pochodzenia zespołu może składać się jedynie z liter.').isAlpha();
    req.checkBody('bandFormDate', 'Data utworzenia zespołu jest wymagana.').notEmpty();
    //req.checkBody('bandFormDate', 'Datę utworzenia zespołu należy podać w odpowiednim formacie.').isISO8601();
    
    let errors = req.validationErrors();

    /*if((new Date(req.body.bandFormDate).getTime()>new Date().getTime())) {
        var error = {param: 'bandFormDate', msg: 'Data utworzenia zespołu nie może być z przyszłości.'};
        if(!errors) {
            errors = [];
        }
        errors.push(error);
    }*/

    let members = req.body.members;
    for(let i = 0; i < members.length; i++) {
        if(members[i].length === 0 || !members[i].replace(/\s/g, '').length) {
            let error = {param: 'members', index: i, msg: 'Podaj imię i nazwisko członka zespołu!'};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }
        if(req.body.membersDate[i].length === 0 || !req.body.membersDate[i].replace(/\s/g, '').length) {
            let error = {param: 'membersDate', index: i, msg: 'Podaj rok rozpoczęcia współpracy!'};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }
        if(req.body.membersDate[i] < req.body.bandFormDate) {
            let error = {param: 'membersDate', index: i, msg: 'Data rozpoczęcia współpracy nie moze być mniejsza niż data założenia zespołu!'};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }
    }

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        let artistsIds = []



        //async.forEach
        /*members.forEach(function(member, index) {
            Artist.findOne({name: member}, function (err, artist) {
                if (err) {
                    console.error(err);
                } else if (!artist) {
                    let error = {param: 'members', index: index, msg: 'Taki artysta nie istnieje!'};
                    if(!errors) {
                        errors = [];
                    }
                    console.log(error);
                    errors.push(error);
                } else {
                    console.log(i + artist);
                    artistsIds.push(artist._id);
                }
            });
        });*/

        Promise.all(
            members.map(function(member, index) {
                return new Promise(function(res){
                    Artist.findOne({name: member}, function (err, artist) {
                        if (err) {
                            console.error(err);
                        } else if (!artist) {
                            let error = {param: 'members', index: index, msg: 'Taki artysta nie istnieje!'};
                            res({error: error});
                            /*if(!errors) {
                                errors = [];
                            }
                            console.log(error);
                            errors.push(error);
                            res(errors);*/
                        } else {
                            //console.log(i + artist);
                            if(new Date(artist.birthDate).getFullYear() > req.body.membersDate[index]) {
                                let error = {param: 'membersDate', index: index, msg: 'Data rozpoczęcia współpracy nie moze być mniejsza niż data urodzenia artysty!'};
                                res({error: error});
                            }
                            artistsIds.push(artist._id);
                            res({artist: artist});
                        }
                    });
                });
           })
           ).then(function(wholeData){
                for(let i = 0; i < wholeData.length; i++) {
                    if('error' in wholeData[i]) {
                        if(!errors) {
                            errors = [];
                        }
                        errors.push(wholeData[i]);
                    }
                }

                if(errors) {
                    return res.status(200).json({
                        errors
                    });
                } else {
                    Band.findOne({name: req.body.bandName}, function(err, band) {
                        if(err) {
                            console.log(err);
                        } else if (band) {
                            let error = {param: 'bandName', msg: 'W bazie już istnieje zespół o takiej nazwie!'};
                            if(!errors) {
                                errors = [];
                            }
                            errors.push(error);
                            return res.status(200).json({
                                errors
                            });
                        } else {
                            let newBand = new Band();
                            newBand.name = req.body.bandName;
                            newBand.surname = req.body.bandSurname;
                            newBand.birthPlace = req.body.bandCountry;
                            newBand.birthDate = req.body.bandBirth;
                    
                            newBand.save(function(err, band) {
                                if (err) {
                                    console.error('/band/addBand error: ' + err);
                                } else {
                                    //console.log(newBand.surname);
                                    Promise.all(
                                        artistsIds.map(function(artistId, index) {
                                            return new Promise(function(resolve){
                                                let bandToArtist = new BandToArtist();
                                                bandToArtist.idBand = band._id;
                                                bandToArtist.idArtist = artistId;
                                                bandToArtist.startYear = req.body.membersDate[index]; 
                                                bandToArtist.endYear = 0;

                                                /**
                                                 * ZABEZPIECZENIE PRZED DODANIEM 2 RAZY TEGO SAMEGO ARTYSTY (FIND Z bandToArtist.idBand; bandToArtist.idArtist )
                                                 * JEZELI ZNALEZIONO TO WYJEBAC BLAD, ALBO W OGOLE WCZESNIEJ TO SPRAWDZIC
                                                 * DODAC MOZLIWOSC DEFINIOWANIA END YEAR
                                                 */

                                                bandToArtist.save(function(err, bandToArtist) {
                                                    if (err) {
                                                        console.error('/BAND/ADDBAND - BANDTOARTIST ERROR:' + err);
                                                        resolve('error')
                                                    } else if (bandToArtist) {
                                                        resolve('success');
                                                    }
                                                });
                                            });
                                       })
                                       ).then(function(wholeData){
                                        console.log('halko');
                                            let flag = wholeData.every(function (currentValue) {
                                                return currentValue = 'success';
                                            })
                                            if(flag) {
                                                res.status(200).json({
                                                    "successMessage" : "Pomyślnie dodano zespół."
                                                });
                                            } else {
                                                res.status(200).json({
                                                    "errorMessage" : "UPS COS POSZLO NIE TAK."
                                                });
                                            }
                                       });
                                }
                            });
                        }
                    })
                }
           });
    }
});

router.post('/editBand/:id', function(req, res) {
    req.checkBody('bandName', 'Nazwa zespołu jest wymagana.').notEmpty();
    req.checkBody('bandOrigin', 'Kraj pochodzenia zespołu jest wymagany.').notEmpty();
    req.checkBody('bandOrigin', 'Kraj pochodzenia zespołu może składać się jedynie z liter.').isAlpha();
    req.checkBody('bandFormDate', 'Data utworzenia zespołu jest wymagana.').notEmpty();
    //req.checkBody('bandFormDate', 'Datę utworzenia zespołu należy podać w odpowiednim formacie.').isISO8601();
    
    let errors = req.validationErrors();

    /*if((new Date(req.body.bandFormDate).getTime()>new Date().getTime())) {
        var error = {param: 'bandFormDate', msg: 'Data utworzenia zespołu nie może być z przyszłości.'};
        if(!errors) {
            errors = [];
        }
        errors.push(error);
    }*/

    let members = req.body.members;
    for(let i = 0; i < members.length; i++) {
        if(members[i].length === 0 || !members[i].replace(/\s/g, '').length) {
            let error = {param: 'members', index: i, msg: 'Podaj imię i nazwisko członka zespołu!'};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }
        if(req.body.membersDate[i].length === 0 || !req.body.membersDate[i].replace(/\s/g, '').length) {
            let error = {param: 'membersDate', index: i, msg: 'Podaj rok rozpoczęcia współpracy!'};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }
        if(req.body.membersDate[i] < req.body.bandFormDate) {
            let error = {param: 'membersDate', index: i, msg: 'Data rozpoczęcia współpracy nie moze być mniejsza niż data założenia zespołu!'};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }
    }

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        let artistsIds = []



        //async.forEach
        /*members.forEach(function(member, index) {
            Artist.findOne({name: member}, function (err, artist) {
                if (err) {
                    console.error(err);
                } else if (!artist) {
                    let error = {param: 'members', index: index, msg: 'Taki artysta nie istnieje!'};
                    if(!errors) {
                        errors = [];
                    }
                    console.log(error);
                    errors.push(error);
                } else {
                    console.log(i + artist);
                    artistsIds.push(artist._id);
                }
            });
        });*/

        Promise.all(
            members.map(function(member, index) {
                return new Promise(function(res){
                    Artist.findOne({name: member}, function (err, artist) {
                        if (err) {
                            console.error(err);
                        } else if (!artist) {
                            let error = {param: 'members', index: index, msg: 'Taki artysta nie istnieje!'};
                            res({error: error});
                            /*if(!errors) {
                                errors = [];
                            }
                            console.log(error);
                            errors.push(error);
                            res(errors);*/
                        } else {
                            //console.log(i + artist);
                            if(new Date(artist.birthDate).getFullYear() > req.body.membersDate[index]) {
                                let error = {param: 'membersDate', index: index, msg: 'Data rozpoczęcia współpracy nie moze być mniejsza niż data urodzenia artysty!'};
                                res({error: error});
                            }
                            artistsIds.push(artist._id);
                            res({artist: artist});
                        }
                    });
                });
           })
           ).then(function(wholeData){
                for(let i = 0; i < wholeData.length; i++) {
                    if('error' in wholeData[i]) {
                        if(!errors) {
                            errors = [];
                        }
                        errors.push(wholeData[i]);
                    }
                }

                if(errors) {
                    return res.status(200).json({
                        errors
                    });
                } else {
                    Band.findOne({name: req.body.bandName}, function(err, band) {
                        if(err) {
                            console.log(err);
                        } else if (band) {
                            let error = {param: 'bandName', msg: 'W bazie już istnieje zespół o takiej nazwie!'};
                            if(!errors) {
                                errors = [];
                            }
                            errors.push(error);
                            return res.status(200).json({
                                errors
                            });
                        } else {
                            let newBand = {};
                            newBand.name = req.body.bandName;
                            newBand.surname = req.body.bandSurname;
                            newBand.birthPlace = req.body.bandCountry;
                            newBand.birthDate = req.body.bandBirth;
                    
                            Band.findByIdAndUpdate(req.params.id, newBand, {new: true}, function(err, band) {
                                if (err) {
                                    console.error('/band/addBand error: ' + err);
                                } else {
                                    //console.log(newBand.surname);
                                    Promise.all(
                                        artistsIds.map(function(artistId, index) {
                                            return new Promise(function(resolve){
                                                let bandToArtist = {};
                                                bandToArtist.idBand = band._id;
                                                bandToArtist.idArtist = artistId;
                                                bandToArtist.startYear = req.body.membersDate[index];
                                                if(typeof req.body.membersEndDate[index] != 'undefined' && req.body.membersEndDate[index].length != 0 && req.body.membersEndDate[index].replace(/\s/g, '').length) {
                                                    bandToArtist.endYear = req.body.membersEndDate[index];
                                                } else {
                                                    bandToArtist.endYear = 0;
                                                }

                                                /**
                                                 * ZABEZPIECZENIE PRZED DODANIEM 2 RAZY TEGO SAMEGO ARTYSTY (FIND Z bandToArtist.idBand; bandToArtist.idArtist )
                                                 * JEZELI ZNALEZIONO TO WYJEBAC BLAD, ALBO W OGOLE WCZESNIEJ TO SPRAWDZIC
                                                 * DODAC MOZLIWOSC DEFINIOWANIA END YEAR
                                                 */
                                                
                                                BandToArtist.findOneAndUpdate({idBand: band._id, idArtist: artistId}, {$set: bandToArtist}, function(err, row) {
                                                    if (err) {
                                                        console.error('/BAND/ADDBAND - BANDTOARTIST ERROR:' + err);
                                                        resolve('error')
                                                    } else if (!row){
                                                        let newBandToArtist = new BandToArtist();
                                                        newBandToArtist.idBand = bandToArtist.idBand;
                                                        newBandToArtist.idArtist = bandToArtist.idArtist;
                                                        newBandToArtist.startYear = bandToArtist.startYear;
                                                        newBandToArtist.endYear = bandToArtist.endYear;
                                                        newBandToArtist.save(function(err, bandToArtist) {
                                                            if (err) {
                                                                console.error('/BAND/ADDBAND - BANDTOARTIST ERROR:' + err);
                                                                resolve('error')
                                                            } else if (bandToArtist) {
                                                                resolve('success');
                                                            }
                                                        });
                                                    } else if (row) {
                                                        resolve('success');
                                                    }
                                                });
                                            });
                                       })
                                       ).then(function(wholeData){
                                        console.log('halko');
                                            let flag = wholeData.every(function (currentValue) {
                                                return currentValue = 'success';
                                            })
                                            if(flag) {
                                                res.status(200).json({
                                                    "successMessage" : "Pomyślnie edytowano dane zespołu."
                                                });
                                            } else {
                                                res.status(200).json({
                                                    "errorMessage" : "UPS COS POSZLO NIE TAK."
                                                });
                                            }
                                       });
                                }
                            });
                        }
                    })
                }
           });
    }
});

router.delete('/id/:id', function(req, res) {
    Band.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.error('/band/id/:id delete error: ' + err);
            res.status(200).json({
                "failureMessage" : "Błąd usuwania zespołu."
            })
        } else {
            res.status(200).json({
                "successMessage" : "Zespół usunięty pomyślnie."
            });
        }
    });
});

module.exports = router;