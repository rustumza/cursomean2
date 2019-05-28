'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination')

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res) {
    var songId = req.params.id;
    Song.findById(songId).populate({ path: 'album' }).exec((err, songSaved) => {
        if (err) {
            res.status(500).send({ message: 'error en el servidor al buscar la cancion' });
        } else {
            if (!songSaved) {
                res.status(404).send({ message: 'error al buscar la cancion' });
            } else {
                return res.status(200).send({ song: songSaved });
            }
        }
    });
}

function getSongs(req, res) {
    var albumId = req.params.albumId;
    if (!albumId) {
        //sacar todos los albums de la base de datos
        var find = Song.find({}).sort('number');
    } else {
        //sacar los albums de un artista concreto
        var find = Song.find({ album: albumId }).sort('number');
    }

    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec((err, songs) => {
        if (err) {
            res.status(500).send({ message: 'error al buscar las canciones' });
        } else {
            if (!songs) {
                res.status(404).send({ message: 'no hay canciones' });
            } else {
                return res.status(200).send({songs});
            }
        }

    });
}

function saveSong(req, res) {
    var song = new Song();
    var params = req.body;
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.fichero = 'null';
    song.album = params.album;

    song.save((err, songStored) => {
        if (err) {
            res.status(500).send({ message: 'error en el servidor al guardar la cancion' });
        } else {
            if (!songStored) {
                res.status(404).send({ message: 'error al guardar la cancion' });
            } else {
                res.status(200).send({ album: songStored });
            }
        }
    });
}

function updateSong(req,res){
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdated) =>{
        if (err) {
            res.status(500).send({ message: 'error en el servidor al actualizar la cancion' });
        } else {
            if (!songUpdated) {
                res.status(404).send({ message: 'error al actualizar la cancion' });
            } else {
                res.status(200).send({songUpdated });
            }
        }
    });
}

function deleteSong(req,res){
    var songId= req.params.id;
    Song.findByIdAndRemove(songId,(err, songDeleted) =>{
        if (err) {
            res.status(500).send({ message: 'error en el servidor al eliminar la cancion' });
        } else {
            if (!songDeleted) {
                res.status(404).send({ message: 'error al eliminar la cancion' });
            } else {
                res.status(200).send({songDeleted});
            }
        }
    });
}

function uploadFile(req,res){
    var songId = req.params.id;
    var file_name = 'No subido';
    console.log(file_path);
    if(req.files){
		var file_path = req.files.file.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];
		//console.log(file_ext);
		if(file_ext == 'mp3' || file_ext == 'ogg'){
			
			Song.findByIdAndUpdate(songId, {fichero:file_name}, (err, songUpdate) =>{
                if(err){
                    res.status(500).send({ message: 'error en el servidor al subir la cancion' });
                }else{
                    if(!songUpdate){
                        res.status(404).send({message: 'no se ha podido actualizar el album'});
                    }else{
                        res.status(200).send({song:songUpdate});
                    }
                }
			});

		}else{
			res.status(404).send({message: 'la extencion del archivo no es correcta'});	
		}
		
		console.log(file_split);
	}else{
		res.status(404).send({message: 'no ha subido ninguna cancion'});
	}
}

function getSongFile(req, res){
	var songFile = req.params.songFile;
	var completeFilePath = './uploads/songs/'+songFile;
	//console.log(completeFilePath);
	fs.exists(completeFilePath,function(exist){
		if(exist){
			res.sendFile(path.resolve(completeFilePath));
		}else{
			res.status(404).send({message: 'No existe la cancion'});	
		}
	});
}

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
};