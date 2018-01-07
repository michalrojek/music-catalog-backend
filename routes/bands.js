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
                                                                //let artistWithYears = {startYear:0, endYear:0};
                                                                //for(var k in artist) artistWithYears[k]=artist[k];
                                                                let artistWithYears = artist.toObject();
                                                                artistWithYears['startYear'] = bandToArtist.startYear;
                                                                artistWithYears['endYear'] = bandToArtist.endYear;
                                                                //for(var k in artist) artistWithYears[k]=artist[k]
                                                                res(artistWithYears);
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
                                                                //let artistWithYears = {startYear:0, endYear:0};
                                                                //for(var k in artist) artistWithYears[k]=artist[k];
                                                                let artistWithYears = artist.toObject();
                                                                artistWithYears['startYear'] = bandToArtist.startYear;
                                                                artistWithYears['endYear'] = bandToArtist.endYear;
                                                                //for(var k in artist) artistWithYears[k]=artist[k]
                                                                res(artistWithYears);
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

router.get('/id/:id', function(req, res) {
    Band.findById(req.params.id, function(err, band) {
        if (err) {
            res.status(200).json({
                "failureMessage" : "Nie znaleziono zespołu"
            });
        } else {
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
                                        let artistWithYears = artist.toObject();
                                        artistWithYears['startYear'] = bandToArtist.startYear;
                                        artistWithYears['endYear'] = bandToArtist.endYear;
                                        res(artistWithYears);
                                    }
                                });
                            });
                        })
                    ).then(function(wholeData){
                        band.members = wholeData;
                        res.status(200).json({
                            band
                        });
                    });
                }
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
                            res(artist);
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
                            newBand.origin = req.body.bandOrigin;
                            newBand.formDate = req.body.bandFormDate;
                    
                            newBand.save(function(err, band) {
                                if (err) {
                                    console.error('/band/addBand error: ' + err);
                                } else {
                                    //console.log(newBand.surname);
                                    Promise.all(
                                        wholeData.map(function(artist, index) {
                                            return new Promise(function(resolve){
                                                let bandToArtist = new BandToArtist();
                                                bandToArtist.idBand = band._id;
                                                bandToArtist.idArtist = artist._id;
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
                            res(artist);
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
                    Band.findOne({name: req.body.bandName, _id: { $not: {$eq:req.params.id}}}, function(err, band) {
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
                            newBand.origin = req.body.bandOrigin;
                            newBand.formDate = req.body.bandFormDate;
                    
                            Band.findByIdAndUpdate(req.params.id, newBand, {new: true}, function(err, band) {
                                if (err) {
                                    console.error('/band/addBand error: ' + err);
                                } else {
                                    //console.log(newBand.surname);
                                    BandToArtist.remove({idBand: req.params.id}, function(err) {
                                        if (err) {
                                            console.log('/band/editBand remove bandToArtists error: ' + err);
                                        } else {
                                            Promise.all(
                                                wholeData.map(function(artist, index) {
                                                    return new Promise(function(resolve){
                                                        //console.log(index + ': ' + req.body.members[index]);
                                                        //console.log(index + ': ' + req.body.membersDate[index]);
                                                        console.log(artist);
                                                        let bandToArtist = new BandToArtist();
                                                        bandToArtist.idBand = band._id;
                                                        bandToArtist.idArtist = artist._id;
                                                        bandToArtist.startYear = req.body.membersDate[index]; 
                                                        if(typeof req.body.membersEndDate[index] != 'undefined' && req.body.membersEndDate[index].length != 0 && req.body.membersEndDate[index].replace(/\s/g, '').length) {
                                                            bandToArtist.endYear = req.body.membersEndDate[index];
                                                        } else {
                                                            bandToArtist.endYear = 0;
                                                        }
        
                                                        //console.log(index + ': ' + bandToArtist);
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
                            });
                        }
                    })
                }
           });
    }
});

router.post('/memberEndDate/:idBand/:idMember', function(req, res) {
    if (req.params.idBand.match(/^[0-9a-fA-F]{24}$/) && req.params.idMember.match(/^[0-9a-fA-F]{24}$/)) {       
        Band.findById(req.params.idBand, function(err, band) {
            if (err) {
                console.error('/bands/memberEndDate find Band error: ' + err);
                res.status(200).json({
                    "failureMessage" : "Wystąpił nieznany błąd! Przepraszamy!"
                });
            } else if (!band) {
                res.status(200).json({
                    "failureMessage" : "Nie znaleziono zespołu o podanym id!"
                });
            } else {
                Artist.findById(req.params.idMember, function(err, artist) {
                    if(err) {
                        console.error('/bands/memberEndDate find Artist error: ' + err);
                        res.status(200).json({
                            "failureMessage" : "Wystąpił nieznany błąd! Przepraszamy!"
                        }); 
                    } else if (!artist) {
                        res.status(200).json({
                            "failureMessage" : "Nie znaleziono artysty o podanym id!"
                        });
                    } else {
                        BandToArtist.findOne({idBand: req.params.idBand, idArtist: req.params.idMember}, function(err, bandToArtist) {
                            if(err) {
                                console.error('/bands/memberEndDate find BandToArtist error: ' + err);
                                res.status(200).json({
                                    "failureMessage" : "Wystąpił nieznany błąd! Przepraszamy!"
                                }); 
                            } else if (!bandToArtist) {
                                res.status(200).json({
                                    "failureMessage" : "Ten artysta nie należy do podanego zespołu!"
                                });
                            } else {
                                BandToArtist.findOne({idBand: req.params.idBand, idArtist: req.params.idMember, endYear: 0}, function(err, bandToArtist) {
                                    if(err) {
                                        console.error('/bands/memberEndDate find BandToArtist error: ' + err);
                                        res.status(200).json({
                                            "failureMessage" : "Wystąpił nieznany błąd! Przepraszamy!"
                                        }); 
                                    } else if (!bandToArtist) {
                                        res.status(200).json({
                                            "failureMessage" : "Rok zakończenia współpracy został określony dla tego artysty!"
                                        });
                                    } else {
                                        req.checkBody('memberEndDate', 'Podaj datę zakończenia współpracy!').notEmpty();
                                        req.checkBody('memberEndDate', 'Rok zakończenia współpracy może się składać jedynie z cyfr!').isInt();

                                        let errors = req.validationErrors();

                                        if(bandToArtist.startYear > req.body.memberEndDate) {
                                            let error = {param: 'memberEndDate', msg: 'Data zakończenia współpracy nie może być mniejsza niż data ropoczęcia wspolpracy!'};
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
                                            BandToArtist.findByIdAndUpdate(bandToArtist._id, {endYear: req.body.memberEndDate}, function(err, bandToArtist) {
                                                if(err) {
                                                    console.error('/bands/memberEndDate update BandToArtist error: ' + err);
                                                    res.status(200).json({
                                                        "failureMessage" : "Wystąpił nieznany błąd! Przepraszamy!"
                                                    }); 
                                                } else {
                                                    res.status(200).json({
                                                        "successMessage" : "Pomyślnie edytowano dane zespołu."
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.status(200).json({
            "failureMessage" : "ID zespołu lub artysty zostało podane w niewłaściwym formacie!"
        }); 
    }
});

router.post('/addMember/:idBand', function(req, res) {
    if (req.params.idBand.match(/^[0-9a-fA-F]{24}$/)) {       
        Band.findById(req.params.idBand, function(err, band) {
            if (err) {
                console.error('/bands/addMember find Band error: ' + err);
                res.status(200).json({
                    "failureMessage" : "Wystąpił nieznany błąd! Przepraszamy!"
                });
            } else if (!band) {
                res.status(200).json({
                    "failureMessage" : "Nie znaleziono zespołu o podanym id!"
                });
            } else {
                req.checkBody('memberName', 'Podaj imię i nazwisko członka zespołu!').notEmpty();
                req.checkBody('memberStartDate', 'Podaj rok rozpoczęcia współpracy!').notEmpty();
                req.checkBody('memberStartDate', 'Rok zakończenia współpracy może się składać jedynie z cyfr!').isInt();

                let errors = req.validationErrors();

                if(req.body.memberStartDate < band.formDate) {
                    let error = {param: 'memberStartDate', msg: 'Rok rozpoczęcia współpracy nie może być mniejszy niż rok rozpoczęcia działalności zespołu!'};
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
                    Artist.findOne({name: req.body.memberName}, function (err, artist) {
                        if (err) {
                            console.error(err);
                        } else if (!artist) {
                            let error = {param: 'memberName', msg: 'Taki artysta nie istnieje!'};
                            if(!errors) {
                                errors = [];
                            }
                            errors.push(error);
                            res.status(200).json({
                                errors
                            });
                        } else {
                            if(new Date(artist.birthDate).getFullYear() > req.body.memberStartDate) {
                                let error = {param: 'memberStartDate', msg: 'Data rozpoczęcia współpracy nie moze być mniejsza niż data urodzenia artysty!'};
                            } else {
                                BandToArtist.find({idBand: req.params.idBand, idArtist: artist._id}).sort({'_id': -1}).limit(1).exec(function(err, bandToArtist) {
                                    if(err) {
                                        console.error('/bands/addMember find BandToArtist error: ' + err);
                                        res.status(200).json({
                                            "failureMessage" : "Wystąpił nieznany błąd! Przepraszamy!"
                                        }); 
                                    } else if (!bandToArtist.length){
                                        let bandToArtist = new BandToArtist();
                                        bandToArtist.idBand = band._id;
                                        bandToArtist.idArtist = artist._id;
                                        bandToArtist.startYear = req.body.memberStartDate; 
                                        if(typeof req.body.memberEndDate != 'undefined' && req.body.memberEndDate.length != 0 && req.body.memberEndDate.replace(/\s/g, '').length) {
                                            if(parseInt(req.body.memberEndDate) < req.body.memberStartDate) {
                                                let error = {param: 'memberStartDate', msg: 'Rok zakończenia współpracy nie może być mniejszy niż rok rozpoczęcia współpracy!'};
                                                if(!errors) {
                                                    errors = [];
                                                }
                                                errors.push(error);
                                            } else {
                                                bandToArtist.endYear = req.body.memberEndDate;
                                            }
                                        } else {
                                            bandToArtist.endYear = 0;
                                        }
        
                                        //console.log(index + ': ' + bandToArtist);
                                        /**
                                        * ZABEZPIECZENIE PRZED DODANIEM 2 RAZY TEGO SAMEGO ARTYSTY (FIND Z bandToArtist.idBand; bandToArtist.idArtist )
                                        * JEZELI ZNALEZIONO TO WYJEBAC BLAD, ALBO W OGOLE WCZESNIEJ TO SPRAWDZIC
                                        * DODAC MOZLIWOSC DEFINIOWANIA END YEAR
                                        */
        
                                        if(errors) {
                                            res.status(200).json({
                                                errors
                                            });
                                        } else {
                                            bandToArtist.save(function(err, bandToArtist) {
                                            if (err) {
                                                console.error('/BAND/ADDBAND - BANDTOARTIST ERROR:' + err);
                                                } else if (bandToArtist) {
                                                    res.status(200).json({
                                                        "successMessage" : "Dodano nowego członka zespołu."
                                                    });
                                                }
                                            });
                                        }
                                    } else if (bandToArtist) {
                                        console.log(bandToArtist[0].endYear);
                                        if(parseInt(bandToArtist[0].endYear) === 0) {
                                            let error = {param: 'memberName', msg: 'Ten artysta jest obecnie w zespole!'};
                                            if(!errors) {
                                                errors = [];
                                            }
                                            errors.push(error);
                                        } else if (bandToArtist[0].endYear > req.body.memberStartDate) {
                                            let error = {param: 'memberStartDate', msg: 'Rok rozpoczęcia nowej współpracy nie może być mniejszy niż rok zakończenia ostatniej współpracy dla danego artysty!'};
                                            if(!errors) {
                                                errors = [];
                                            }
                                            errors.push(error);
                                        } else if (bandToArtist[0].endYear === parseInt(req.body.memberStartDate)) {
                                            let error = {param: 'memberStartDate', msg: 'W bazie już znajduje się rekord informujący o nawiązaniu współpracy dla tego artysty w podanym roku!'};
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
                                            let bandToArtist = new BandToArtist();
                                            bandToArtist.idBand = band._id;
                                            bandToArtist.idArtist = artist._id;
                                            bandToArtist.startYear = req.body.memberStartDate; 
                                            if(typeof req.body.memberEndDate != 'undefined' && req.body.memberEndDate.length != 0 && req.body.memberEndDate.replace(/\s/g, '').length) {
                                                if(parseInt(req.body.memberEndDate) < req.body.memberStartDate) {
                                                    let error = {param: 'memberStartDate', msg: 'Rok zakończenia współpracy nie może być mniejszy niż rok rozpoczęcia współpracy!'};
                                                    if(!errors) {
                                                        errors = [];
                                                    }
                                                    errors.push(error);
                                                } else {
                                                    bandToArtist.endYear = req.body.memberEndDate;
                                                }
                                            } else {
                                                bandToArtist.endYear = 0;
                                            }
        
                                            //console.log(index + ': ' + bandToArtist);
                                            /**
                                            * ZABEZPIECZENIE PRZED DODANIEM 2 RAZY TEGO SAMEGO ARTYSTY (FIND Z bandToArtist.idBand; bandToArtist.idArtist )
                                            * JEZELI ZNALEZIONO TO WYJEBAC BLAD, ALBO W OGOLE WCZESNIEJ TO SPRAWDZIC
                                            * DODAC MOZLIWOSC DEFINIOWANIA END YEAR
                                            */
        
                                            if(errors) {
                                                res.status(200).json({
                                                    errors
                                                });
                                            } else {
                                                bandToArtist.save(function(err, bandToArtist) {
                                                if (err) {
                                                    console.error('/BAND/ADDBAND - BANDTOARTIST ERROR:' + err);
                                                    } else if (bandToArtist) {
                                                        res.status(200).json({
                                                            "successMessage" : "Dodano nowego członka zespołu."
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    } else {
        res.status(200).json({
            "failureMessage" : "ID zespołu zostało podane w niewłaściwym formacie!"
        }); 
    }
});

router.delete('/id/:id', function(req, res) {
    Band.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.error('/band/id/:id Band delete error: ' + err);
            res.status(200).json({
                "failureMessage" : "Błąd usuwania zespołu."
            });
        } else {
            BandToArtist.remove({idBand: req.params.id}, function(err) {
                if (err) {
                    console.error('/band/id/:id BandToArtist delete error: ' + err);
                    res.status(200).json({
                        "failureMessage" : "Błąd usuwania zespołu."
                    });
                } else {
                    res.status(200).json({
                        "successMessage" : "Zespół usunięty pomyślnie."
                    });
                }
            });
        }
    });
});

module.exports = router;