const express = require('express');
const router = express.Router();
let mongoose = require('mongoose');

let Album = require('../models/album');
let Band = require('../models/band');
let Artist = require('../models/artist');
let BandToArtist = require('../models/bandToArtist');
let Genre = require('../models/genre');
let Edition = require('../models/edition');
let AlbumType = require('../models/albumType');

router.get('/all/:page', function(req, res) {
    if (!isNaN(parseInt(req.params.page))) {
        let albumOffset = parseInt(req.params.page) * 5 - 5;
        console.log(parseInt(req.params.page));
        Album.find({}).limit(5).skip(albumOffset).exec(function(err, albums) {
            if (err) {
                console.error('/album/all/:page error: ' + err);
            } else {
                Album.count({}, function(countErr, count) {
                    if (countErr) {
                        console.error('/album/all/:page count error: ' + countErr);
                    } else {
                        Promise.all(
                            albums.map(function(album, index) {
                                return new Promise(function(res){
                                    Artist.findById(album.idArtist, function (err, artist) {
                                        if (err) {
                                            console.error(err);
                                            res(1);
                                        } else if (artist){
                                            let albumWithArtist = album.toObject();
                                            albumWithArtist['artistName'] = artist.name;
                                            res(albumWithArtist);
                                        } else {
                                            Band.findById(album.idArtist, function (err, band) {
                                                if (err) {
                                                    console.error(err);
                                                    res(1);
                                                } else if (band){
                                                    let albumWithBand = album.toObject();
                                                    albumWithBand['bandName'] = band.name;
                                                    res(albumWithBand);
                                                }
                                            });
                                        }
                                    });
                                });
                            })
                        ).then(function(wholeData){
                            res.status(200).json({
                                "albumCount" : count,
                                "albums" : wholeData
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
        let albumOffset = parseInt(req.query.page) * 5 - 5;
        //console.log(parseInt(req.params.page));
        let myAlbumRegex = new RegExp('.*' + req.query.searchAlbum + '.*', 'g');
        let myAuthorRegex = new RegExp('.*' + req.query.searchAuthor + '.*', 'g');
        let myAlbumTypeRegex = new RegExp('.*' + req.query.searchAlbumType + '.*', 'g');
        let myGenreRegex = new RegExp('.*' + req.query.searchGenre + '.*', 'g');
        let myEditionRegex = new RegExp('.*' + req.query.searchEdition + '.*', 'g');
        /**Album.find({name: {$regex : myRegex, $options: 'i'}}).limit(5).skip(albumOffset).exec(function(err, albums) {
            if (err) {
                console.error('/album/search/query error: ' + err);
            } else {
                Album.count({name: {$regex : myRegex, $options: 'i'}}, function(countErr, count) {
                    if (countErr) {
                        console.error('/album/search/query count error: ' + countErr);
                    } else {
                        Promise.all(
                            albums.map(function(album, index) {
                                return new Promise(function(res){
                                    album.aggregate([{
                                        $lookup: { 
                                            from: 'artists', 
                                            localField: 'idArtist', 
                                            foreignField: '_id', 
                                            as: 'artist' 
                                        }
                                    }], function(err, result) {
                                        console.log(result);
                                    });
                                    res(1);
                                    /*Artist.findById(album.idArtist, function (err, artist) {
                                        if (err) {
                                            console.error(err);
                                            res(1);
                                        } else if (artist){
                                            let albumWithArtist = album.toObject();
                                            albumWithArtist['artistName'] = artist.name;
                                            res(albumWithArtist);
                                        } else {
                                            Band.findById(album.idArtist, function (err, band) {
                                                if (err) {
                                                    console.error(err);
                                                    res(1);
                                                } else if (band){
                                                    let albumWithBand = album.toObject();
                                                    albumWithBand['bandName'] = band.name;
                                                    res(albumWithBand);
                                                }
                                            });
                                        }
                                    });
                                });
                            })
                        ).then(function(wholeData){
                            res.status(200).json({
                                "albumCount" : count,
                                "albums" : wholeData
                            });
                        });
                    }
                });
            }
        });*/
        Album.aggregate([{
            $match: {
                name: {$regex : myAlbumRegex, $options: 'i'}
            }
        },
        {
            $lookup: {
                from: "artists",
                "localField": "idArtist",
                "foreignField": "_id",
                as: "artist"
            }       
        }, 
        {
            "$unwind":"$artist"
        },
        { 
            $match: { 
                "artist.name": {$regex : myAuthorRegex, $options: 'i'} 
            } 
        },
        {
            $lookup: {
                "from": "albumtypes",
                "localField": "idAlbumType",
                "foreignField": "_id",
                "as": "albumType"
            }       
        },
        {
            $lookup: {
                "from": "genres",
                "localField": "idGenres",
                "foreignField": "_id",
                "as": "genres"
            }       
        },
        { 
            $match: { 
                "genres.name": {$regex : myGenreRegex, $options: 'i'} 
            } 
        },
        {
            $lookup: {
                "from": "editions",
                "localField": "idEditions",
                "foreignField": "_id",
                "as": "editions"
            }       
        }], function(err, result) {
            res.status(200).json({
                result
            })
        })
    } else {
        res.status(200).json({
            message: "Ty chujuuu."
        });
    }
});

router.get('/id/:id', function(req, res) {
    Album.findById(req.params.id, function(err, album) {
        if(err) {
            console.error('/album/id/:id Album find error: ' + err);
            res.status(200).json({
                failureMessage: "Wystąpił niespodziewany błąd przy wyszukiwaniu albumu"
            });
        } else if (!album) {
            res.status(200).json({
                failureMessage: "Nie znaleziono albumu o podanym id"
            });
        } else {
            AlbumType.findById(album.idAlbumType, function(err, albumType) {
                if(err) {
                    console.error('/album/id/:id AlbumType find error: ' + err);
                    res.status(200).json({
                        failureMessage: "Wystąpił niespodziewany błąd przy wyszukiwaniu typu albumu"
                    });
                } else if (!album) {
                    res.status(200).json({
                        failureMessage: "Nie znaleziono typu albumu o podanym id"
                    });
                } else {
                    let albumInfo = album.toObject();
                    albumInfo['albumType'] = albumType.name;
                    Artist.findById(album.idArtist, function(err, artist) {
                        if(err) {
                            console.error('/album/id/:id Artist find error: ' + err);
                            res.status(200).json({
                                failureMessage: "Wystąpił niespodziewany błąd przy wyszukiwaniu autora albumu"
                            });
                        } else if (!artist) {
                            Band.findById(album.idArtist, function(err, band) {
                                if(err) {
                                    console.error('/album/id/:id Band find error: ' + err);
                                    res.status(200).json({
                                        failureMessage: "Wystąpił niespodziewany błąd przy wyszukiwaniu autora albumu"
                                    });
                                } else if (!band) {
                                    res.status(200).json({
                                        failureMessage: "Nie znaleziono autora albumu o podanym id"
                                    });
                                } else {
                                    albumInfo['author'] = band.name;
                                    findGenresAndEditions(albumInfo, album.idGenres, album.idEditions);
                                }
                            });
                        } else {
                            albumInfo['author'] = artist.name;
                            findGenresAndEditions(albumInfo, album.idGenres, album.idEditions);
                        }
                    });
                }
            });
        }
    });

    function findGenresAndEditions(albumInfo, genres, editions) {
        Promise.all(
            genres.map(function(genre, index) {
                return new Promise(function(res){
                    Genre.findById(genre, function (err, genre) {
                        if (err) {
                            console.error(err);
                            res(1);
                        } else {
                            res(genre.name);
                        }
                    });
                });
            })
        ).then(function(genres){
            albumInfo['genres'] = genres;
            Promise.all(
                editions.map(function(edition, index) {
                    return new Promise(function(res){
                        Edition.findById(edition, function (err, edition) {
                            if (err) {
                                console.error(err);
                                res(1);
                            } else {
                                res(edition.name);
                            }
                        });
                    });
                })
            ).then(function(editions){
                albumInfo['editions'] = editions;
                res.status(200).json({
                    albumInfo
                });
            });
        });
    }
});

router.post('/addAlbum', function(req, res) {
    req.checkBody('albumName', 'Tytuł albumu jest wymagany.').notEmpty();
    req.checkBody('albumReleaseDate', 'Data wydania albumu jest wymagana.').notEmpty();
    req.checkBody('albumReleaseDate', 'Datę wydania albumu należy podać w odpowiednim formacie.').isISO8601();
    req.checkBody('albumAuthor', 'Autor albumu jest wymagany.').notEmpty();
    req.checkBody('albumGenre', 'Gatunek albumu jest wymagany.').notEmpty();
    req.checkBody('albumType', 'Typ albumu jest wymagany.').notEmpty();
    req.checkBody('albumEdition', 'Wydanie albumu jest wymagane.').notEmpty();
    req.checkBody('albumTrackName', 'Lista nazw piosenek albumu jest wymagana.').notEmpty();
    req.checkBody('albumTrackLength', 'Lista czasu trwania piosenek albumu jest wymagana.').notEmpty();
    
    let errors = req.validationErrors();

    /*if((new Date(req.body.bandFormDate).getTime()>new Date().getTime())) {
        var error = {param: 'bandFormDate', msg: 'Data utworzenia zespołu nie może być z przyszłości.'};
        if(!errors) {
            errors = [];
        }
        errors.push(error);
    }*/

    let genres = req.body.albumGenre;
    let albumType = req.body.albumType;
    let editions = req.body.albumEdition;
    let tracksNames = req.body.albumTrackName;
    let tracksLengths = req.body.albumTrackLength;
    let albumDuration = 0;

    function checkIfInputsAreEmpty(arrayOfInputs, paramName, message) {
        if(Array.isArray(arrayOfInputs)) {
            for(let i = 0; i < arrayOfInputs.length; i++) {
                if(arrayOfInputs[i].length === 0 || !arrayOfInputs[i].replace(/\s/g, '').length) {
                    let error = {param: paramName, index: i, msg: message};
                    if(!errors) {
                        errors = [];
                    }
                    errors.push(error);
                }
            }
        }
    }

    checkIfInputsAreEmpty(genres, 'albumGenre', 'Podaj nazwę gatunku!');
    //checkIfInputsAreEmpty(types, 'albumType', 'Podaj nazwę typu albumu!');
    checkIfInputsAreEmpty(editions, 'albumEdition', 'Podaj nazwę wydania!');
    checkIfInputsAreEmpty(tracksNames, 'albumTrackName', 'Podaj tytuł piosenki!');
    checkIfInputsAreEmpty(tracksLengths, 'albumTrackLength', 'Podaj czas trwania piosenki!');

    if(Array.isArray(tracksLengths)) {
        for (let i = 0; i < tracksLengths.length; i++) {
            albumDuration += parseInt(tracksLengths[i]);
        }
    } else {
        albumDuration = tracksLengths;
    }


    //teoretycznie trackNames zawsze jest tablicą, z postmana mogę wysłać zapytanie które nią nie będzie - ewentualnie to poprawić
    if(albumType === 'Single' && (tracksNames.length > 2 || albumDuration > 10)) {
        let error = {param: 'albumTrackName', index: tracksNames.length - 1, msg: "Album typu single może mieć maksymalnie 2 piosenki i trwać 10 minut! "};
        if(!errors) {
            errors = [];
        }
        errors.push(error);
    } else if(albumType === 'EP' && (tracksNames.length > 5 || albumDuration > 30)) {
        let error = {param: 'albumTrackName', index: tracksNames.length - 1, msg: "Album typu extended play może mieć maksymalnie 5 piosenek i trwać 30 minut! "};
        if(!errors) {
            errors = [];
        }
        errors.push(error);
    }

    function checkIfDocumentsExists(genres, editions, albumType, response, idArtist){
        Promise.all(
            genres.map(function(genre, index) {
                return new Promise(function(resolve, reject) {
                    Genre.findOne({name: genre}, function(err, genre) {
                        if(err) {
                            console.error('/album/addAlbum Genre find error: ' + err);
                            let error = { failureMessage: "Wysątpił niespodziewany błąd przy dodawaniu albumu." };
                            resolve({error: error});
                        } else if (!genre) {
                            let error = {param: 'albumGenre', index: index, msg: 'Taki gatunek nie istnieje!'};
                            resolve({error: error});
                        } else {
                            resolve(genre);
                        }
                    });
                });
            })
        ).then(function(genres) {
            for(let i = 0; i < genres.length; i++) {
                if('error' in genres[i]) {
                    if(!errors) {
                        errors = [];
                    }
                    errors.push(genres[i]);
                }
            }

            if(errors) {
                response.status(200).json({
                    errors
                });

                return false;
            } else {
                Promise.all(
                    editions.map(function(edition, index) {
                        return new Promise(function(resolve, reject) {
                            Edition.findOne({name: edition}, function(err, edition) {
                                if(err) {
                                    console.error('/album/addAlbum Edition find error: ' + err);
                                    let error = { failureMessage: "Wysątpił niespodziewany błąd przy dodawaniu albumu." };
                                    resolve({error: error});
                                } else if (!edition) {
                                    let error = {param: 'albumEdition', index: index, msg: 'Takie wydanie albumu nie istnieje!'};
                                    resolve({error: error});
                                } else if (edition) {
                                    resolve(edition);
                                }
                            });
                        });
                    })
                ).then(function(editions) {
                    for(let i = 0; i < editions.length; i++) {
                        if('error' in editions[i]) {
                            if(!errors) {
                                errors = [];
                            }
                            errors.push(editions[i]);
                        }
                    }
        
                    if(errors) {
                        response.status(200).json({
                            errors
                        });

                        return false;
                    } else {
                        AlbumType.findOne({name: albumType}, function(err, albumType) {
                            if(err) {
                                console.error('/album/addAlbum AlbumType find error: ' + err);
                                let error = { failureMessage: "Wysątpił niespodziewany błąd przy dodawaniu albumu." };
                                if(!errors) {
                                    errors = [];
                                }
                                errors.push(error);
                                response.status(200).json({
                                    errors
                                });
                                return false;
                            } else if (!albumType) {
                                let error = {param: 'albumType', msg: 'Taki typ albumu nie istnieje!'};
                                if(!errors) {
                                    errors = [];
                                }
                                errors.push(error);
                                response.status(200).json({
                                    errors
                                });
                                return false;
                            } else {
                                let newAlbum = new Album();
                                newAlbum.name = req.body.albumName;
                                newAlbum.releaseDate = req.body.albumReleaseDate;
                                newAlbum.length = albumDuration;
                                newAlbum.tracks = [];
                                for(let i = 0; i < tracksNames.length; i++) {
                                    newAlbum.tracks.push({trackName: tracksNames[i], trackDuration: tracksLengths[i]});
                                }
                                newAlbum.idArtist = idArtist;
                                newAlbum.idAlbumType = albumType._id;
                                newAlbum.idGenres = [];
                                for(let i = 0; i < genres.length; i++) {
                                    newAlbum.idGenres.push(genres[i]._id);
                                }
                                newAlbum.idEditions = [];
                                for(let i = 0; i < editions.length; i++) {
                                    newAlbum.idEditions.push(editions[i]._id);
                                }

                                newAlbum.save(function(err) {
                                    if (err) {
                                        console.error('/albumType/addAlbum error: ' + err);
                                    } else {
                                        res.status(200).json({
                                            successMessage : "Pomyślnie dodano album."
                                        });
                                    }
                                })
                                return true;
                            }
                        });
                    }
                });
            }
        });
    }

    function addAlbum(idArtist) {
        let newAlbum = new Album();
        newAlbum.name = req.body.albumName;
        newAlbum.releaseDate = req.body.albumReleaseDate;
        newAlbum.idArtist = idArtist;
        newAlbum.
        res.status(200).json({
            successMessage: "yay"
        });
    }

    if(errors) {
        res.status(200).json({
            errors
        });
    } else {
        Artist.findOne({name: req.body.albumAuthor}, function(err, artist) {
            if (err) {
                console.error('/album/addAlbum Artist find error: ' + err);
            } else if (!artist) {
                Band.findOne({name: req.body.albumAuthor}, function(err, band) {
                    if (err) {
                        console.error('/album/addAlbum Band find error: ' + err);
                    } else if (!band) {
                        let error = {param: 'albumAuthor', msg: 'Taki artysta/zespoł nie istnieje!'};
                        if(!errors) {
                            errors = [];
                        }
                        errors.push(error);
                        res.status(200).json({
                            errors
                        });
                    } else if (band) {
                        checkIfDocumentsExists(genres, editions, albumType, res, band._id);
                    }
                });
            } else if (artist) {
                checkIfDocumentsExists(genres, editions, albumType, res, artist._id);
            }
        });
    }
});

/*Album.find({}, function(err, docs) {
    docs.forEach(function(doc, index) {
        let newAlbum = doc.toObject();
        newAlbum.idArtist = mongoose.Types.ObjectId(newAlbum.idArtist);
        newAlbum.idAlbumType = mongoose.Types.ObjectId(newAlbum.idAlbumType);
        Album.findByIdAndUpdate(doc._id, newAlbum, function(err){
            console.log('elo')
        })
    })
    /*let newAlbum = doc.toObject();
    newAlbum.idAlbumType = mongoose.Types.ObjectId(newAlbum.idAlbumType); 
    console.log(newAlbum.idArtist);
    Album.findByIdAndUpdate(doc._id, newAlbum, function(err){
        console.log('elo')
    })
})*/

router.post('/editAlbum/:id', function(req, res) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {  
        req.checkBody('albumName', 'Tytuł albumu jest wymagany.').notEmpty();
        req.checkBody('albumReleaseDate', 'Data wydania albumu jest wymagana.').notEmpty();
        req.checkBody('albumReleaseDate', 'Datę wydania albumu należy podać w odpowiednim formacie.').isISO8601();
        req.checkBody('albumAuthor', 'Autor albumu jest wymagany.').notEmpty();
        req.checkBody('albumGenre', 'Gatunek albumu jest wymagany.').notEmpty();
        req.checkBody('albumType', 'Typ albumu jest wymagany.').notEmpty();
        req.checkBody('albumEdition', 'Wydanie albumu jest wymagane.').notEmpty();
        req.checkBody('albumTrackName', 'Lista nazw piosenek albumu jest wymagana.').notEmpty();
        req.checkBody('albumTrackLength', 'Lista czasu trwania piosenek albumu jest wymagana.').notEmpty();
        
        let errors = req.validationErrors();

        /*if((new Date(req.body.bandFormDate).getTime()>new Date().getTime())) {
            var error = {param: 'bandFormDate', msg: 'Data utworzenia zespołu nie może być z przyszłości.'};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }*/

        let genres = req.body.albumGenre;
        let albumType = req.body.albumType;
        let editions = req.body.albumEdition;
        let tracksNames = req.body.albumTrackName;
        let tracksLengths = req.body.albumTrackLength;
        let albumDuration = 0;

        function checkIfInputsAreEmpty(arrayOfInputs, paramName, message) {
            if(Array.isArray(arrayOfInputs)) {
                for(let i = 0; i < arrayOfInputs.length; i++) {
                    if(arrayOfInputs[i].length === 0 || !arrayOfInputs[i].replace(/\s/g, '').length) {
                        let error = {param: paramName, index: i, msg: message};
                        if(!errors) {
                            errors = [];
                        }
                        errors.push(error);
                    }
                }
            }
        }

        checkIfInputsAreEmpty(genres, 'albumGenre', 'Podaj nazwę gatunku!');
        //checkIfInputsAreEmpty(types, 'albumType', 'Podaj nazwę typu albumu!');
        checkIfInputsAreEmpty(editions, 'albumEdition', 'Podaj nazwę wydania!');
        checkIfInputsAreEmpty(tracksNames, 'albumTrackName', 'Podaj tytuł piosenki!');
        checkIfInputsAreEmpty(tracksLengths, 'albumTrackLength', 'Podaj czas trwania piosenki!');

        if(Array.isArray(tracksLengths)) {
            for (let i = 0; i < tracksLengths.length; i++) {
                albumDuration += parseInt(tracksLengths[i]);
            }
        } else {
            albumDuration = tracksLengths;
        }


        //teoretycznie trackNames zawsze jest tablicą, z postmana mogę wysłać zapytanie które nią nie będzie - ewentualnie to poprawić
        if(albumType === 'Single' && (tracksNames.length > 2 || albumDuration > 10)) {
            let error = {param: 'albumTrackName', index: tracksNames.length - 1, msg: "Album typu single może mieć maksymalnie 2 piosenki i trwać 10 minut! "};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        } else if(albumType === 'EP' && (tracksNames.length > 5 || albumDuration > 30)) {
            let error = {param: 'albumTrackName', index: tracksNames.length - 1, msg: "Album typu extended play może mieć maksymalnie 5 piosenek i trwać 30 minut! "};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }

        function checkIfDocumentsExists(genres, editions, albumType, response, idArtist){
            Promise.all(
                genres.map(function(genre, index) {
                    return new Promise(function(resolve, reject) {
                        Genre.findOne({name: genre}, function(err, genre) {
                            if(err) {
                                console.error('/album/addAlbum Genre find error: ' + err);
                                let error = { failureMessage: "Wysątpił niespodziewany błąd przy dodawaniu albumu." };
                                resolve({error: error});
                            } else if (!genre) {
                                let error = {param: 'albumGenre', index: index, msg: 'Taki gatunek nie istnieje!'};
                                resolve({error: error});
                            } else {
                                resolve(genre);
                            }
                        });
                    });
                })
            ).then(function(genres) {
                for(let i = 0; i < genres.length; i++) {
                    if('error' in genres[i]) {
                        if(!errors) {
                            errors = [];
                        }
                        errors.push(genres[i]);
                    }
                }

                if(errors) {
                    response.status(200).json({
                        errors
                    });

                    return false;
                } else {
                    Promise.all(
                        editions.map(function(edition, index) {
                            return new Promise(function(resolve, reject) {
                                Edition.findOne({name: edition}, function(err, edition) {
                                    if(err) {
                                        console.error('/album/addAlbum Edition find error: ' + err);
                                        let error = { failureMessage: "Wysątpił niespodziewany błąd przy dodawaniu albumu." };
                                        resolve({error: error});
                                    } else if (!edition) {
                                        let error = {param: 'albumEdition', index: index, msg: 'Takie wydanie albumu nie istnieje!'};
                                        resolve({error: error});
                                    } else if (edition) {
                                        resolve(edition);
                                    }
                                });
                            });
                        })
                    ).then(function(editions) {
                        for(let i = 0; i < editions.length; i++) {
                            if('error' in editions[i]) {
                                if(!errors) {
                                    errors = [];
                                }
                                errors.push(editions[i]);
                            }
                        }
            
                        if(errors) {
                            response.status(200).json({
                                errors
                            });

                            return false;
                        } else {
                            AlbumType.findOne({name: albumType}, function(err, albumType) {
                                if(err) {
                                    console.error('/album/addAlbum AlbumType find error: ' + err);
                                    let error = { failureMessage: "Wysątpił niespodziewany błąd przy dodawaniu albumu." };
                                    if(!errors) {
                                        errors = [];
                                    }
                                    errors.push(error);
                                    response.status(200).json({
                                        errors
                                    });
                                    return false;
                                } else if (!albumType) {
                                    let error = {param: 'albumType', msg: 'Taki typ albumu nie istnieje!'};
                                    if(!errors) {
                                        errors = [];
                                    }
                                    errors.push(error);
                                    response.status(200).json({
                                        errors
                                    });
                                    return false;
                                } else {
                                    let newAlbum = {};
                                    newAlbum.name = req.body.albumName;
                                    newAlbum.releaseDate = req.body.albumReleaseDate;
                                    newAlbum.length = albumDuration;
                                    newAlbum.tracks = [];
                                    for(let i = 0; i < tracksNames.length; i++) {
                                        newAlbum.tracks.push({trackName: tracksNames[i], trackDuration: tracksLengths[i]});
                                    }
                                    newAlbum.idArtist = idArtist;
                                    newAlbum.idAlbumType = albumType._id;
                                    newAlbum.idGenres = [];
                                    for(let i = 0; i < genres.length; i++) {
                                        newAlbum.idGenres.push(genres[i]._id);
                                    }
                                    newAlbum.idEditions = [];
                                    for(let i = 0; i < editions.length; i++) {
                                        newAlbum.idEditions.push(editions[i]._id);
                                    }

                                    Album.findByIdAndUpdate(req.params.id, newAlbum, function(err, album) {
                                        if (err) {
                                            console.error('/albumType/editAlbum:id error: ' + err);
                                        } else if(!album) {
                                            res.status(200).json({
                                                failureMessage : "Nie znaleziono albumu o podanym id."
                                            });
                                        } else {
                                            res.status(200).json({
                                                successMessage : "Pomyślnie edytowano album."
                                            });
                                        }
                                    })
                                    return true;
                                }
                            });
                        }
                    });
                }
            });
        }

        if(errors) {
            res.status(200).json({
                errors
            });
        } else {
            Artist.findOne({name: req.body.albumAuthor}, function(err, artist) {
                if (err) {
                    console.error('/album/addAlbum Artist find error: ' + err);
                } else if (!artist) {
                    Band.findOne({name: req.body.albumAuthor}, function(err, band) {
                        if (err) {
                            console.error('/album/addAlbum Band find error: ' + err);
                        } else if (!band) {
                            let error = {param: 'albumAuthor', msg: 'Taki artysta/zespoł nie istnieje!'};
                            if(!errors) {
                                errors = [];
                            }
                            errors.push(error);
                            res.status(200).json({
                                errors
                            });
                        } else if (band) {
                            checkIfDocumentsExists(genres, editions, albumType, res, band._id);
                        }
                    });
                } else if (artist) {
                    checkIfDocumentsExists(genres, editions, albumType, res, artist._id);
                }
            });
        }
    } else {
        res.status(200).json({
            failureMessage : "ID albumu zostało podane w niewłaściwym formacie!"
        }); 
    }
});

router.delete('/id/:id', function(req, res) {
    Album.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.error('/album/id/:id delete error: ' + err);
            res.status(200).json({
                failureMessage : "Błąd usuwania albumu."
            })
        } else {
            res.status(200).json({
                successMessage : "Album usunięty pomyślnie."
            });
        }
    });
});

module.exports = router;