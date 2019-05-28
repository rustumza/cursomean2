'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination')

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

//var bcrypt = require('bcrypt-nodejs');
//var User = require('../models/artist');
//var jwt = require('../services/jwt');


function getAlbum(req, res) {
    var albumId = req.params.id;

    Album.findById(albumId).populate({path: 'artist'}).exec((err,album)=>{
        if(err){
            res.status(500).send({message: 'error al buscar el album'});
        }else{
            if(!album){
                res.status(404).send({message: 'el album no existe'});
            }else{
                return res.status(200).send({album: album});
            }
        }
    });
}

function getAlbums(req,res){
    var artistId = req.params.artist;

    if(!artistId){
        //sacar todos los albums de la base de datos
        var find = Album.find({}).sort('title');
    }else{
        //sacar los albums de un artista concreto
        var find = Album.find({artist: artistId}).sort('year');
    }

    find.populate({path: 'artist'}).exec((err,albums)=>{
        if(err){
            res.status(500).send({message: 'error al buscar los albums'});
        }else{
            if(!albums){
                res.status(404).send({message: 'no hay albums'});
            }else{
                return res.status(200).send({albums: albums});
            }
        }

    });    
}

function saveAlbum(req,res){
    var album = new Album();
    var params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null'
    album.artist = params.artist;

    album.save((err, albumStored)=>{
        if(err){
            res.status(500).send({message: 'error en el servidor'});
        }else{
            if(!albumStored){
                res.status(404).send({message: 'error al guardar el album'});
            }else{
                res.status(200).send({album: albumStored});
            }
        }
    });
}

function updateAlbum(req,res){
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId,update,(err,albumUpdated)=>{
        if(err){
            res.status(500).send({message: 'error en el servidor al actualizar el album'});
        }else{
            if(!albumUpdated){
                res.status(404).send({message: 'error al actualizar el album'});
            }else{
                return res.status(200).send({album: albumUpdated});
            }
        }
    });
}

function deleteAlbum(req,res){
    var albumId = req.params.id;

    Album.findByIdAndRemove(albumId,(err, albumRemoved) => { //si yo uso findById(id).remove() 
                                                            //me devuelve la cant de reg eliminados en lugar del album eliminado
        if (err) {
            return res.status(500).send({ message: 'Error al eliminar los albumes' });
        } else {
            if (!albumRemoved) {
                return res.status(404).send({ message: 'Los albumes no ha sido eliminados' });
            } else {
                Song.find({ album: albumRemoved._id }).remove((err, songRemoved) => {
                    if (err) {
                        return res.status(500).send({ message: 'Error al eliminar las canciones' });
                    } else {
                        if (!songRemoved) {
                            return res.status(404).send({ message: 'las canciones no han sido eliminadas' });
                        } else {
                            return res.status(200).send({ album: albumRemoved});
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req,res){
    var albumId = req.params.id;
    var file_name = 'No subido';
    if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];
		//console.log(file_ext);
		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
			
			Album.findByIdAndUpdate(albumId, {image:file_name}, (err, albumUpdate) =>{
                if(err){
                    res.status(500).send({ message: 'error en el servidor al subir la imagen' });
                }else{
                    if(!albumUpdate){
                        res.status(404).send({message: 'no se ha podido actualizar el album'});
                    }else{
                        res.status(200).send({album:albumUpdate});
                    }
                }
			});

		}else{
			res.status(404).send({message: 'la extencion del archivo no es correcta'});	
		}
		
		console.log(file_split);
	}else{
		res.status(404).send({message: 'no ha subido ninguna imagen'});
	}
}

function getImageFile(req, res){
	var imageFile = req.params.imageFile;
	var completeFilePath = './uploads/albums/'+imageFile;
	//console.log(completeFilePath);
	fs.exists(completeFilePath,function(exist){
		if(exist){
			res.sendFile(path.resolve(completeFilePath));
		}else{
			res.status(404).send({message: 'No existe la imagen'});	
		}
	});
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
};