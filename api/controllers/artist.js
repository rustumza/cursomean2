'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination')

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res) {
    var artistId = req.params.id;

    Artist.findById(artistId, (err, artist) => {
        if (err) {
            return res.status(500).send({ message: 'Error al buscar el artista' });
        } else {
            if (!artist) {
                return res.status(404).send({ message: 'no se ha podido encontrar el artista' });
            } else {
                return res.status(200).send({ artist: artist }); //se pone el return aca para cortar la ejecucion, sino sigue 
                //con los pasos de abajo y puede fallar
            }
        }
    });
    //res.status(200).send({message: 'metodo getArtist del controlador artist.js'});
}

function getArtists(req, res) {
    if (req.params.page) {
        var page = req.params.page;
    } else {
        var page = 1;
    }
    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, (err, artists, total) => {
        if (err) {
            res.status(500).send({ message: 'Error al buscar los artistas' });
        } else {
            if (!artists) {
                res.status(404).send({ message: 'No hay artistas' });
            } else {
                return res.status(200).send({
                    total_items: total,
                    artists: artists
                });
            }
        }
    });

    mongoosePaginate
    //res.status(200).send({message: 'metodo getArtist del controlador artist.js'});
}

function saveArtist(req, res) {
    var artist = new Artist();

    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    if (artist.name != null && artist.description != null) {
        //guarde el artista
        artist.save((err, artistStored) => {
            if (err) {
                res.status(500).send({ message: 'Error al guardar el artista' });
            } else {
                if (!artistStored) {
                    res.status(404).send({ message: 'No se ha registrado el artista' });
                } else {
                    res.status(200).send({ user: artistStored });
                }
            }
        });
    } else {
        res.status(200).send({ message: 'Introduce todos los campos' });
    }

}

function updateArtist(req, res) {
    var artistId = req.params.id;
    var update = req.body;
    console.log(update);

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if (err) {
            return res.status(500).send({ message: 'Error al guardar el artista' });
        } else {
            if (!artistUpdated) {
                return res.status(404).send({ message: 'Error al actualizar el artista' });
            } else {
                return res.status(200).send({ user: artistUpdated });
            }
        }
    });
}

function deleteArtist(req, res) {
    var artistId = req.params.id;

    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if (err) {
            return res.status(500).send({ message: 'Error al eliminar el artista' });
        } else {
            if (!artistRemoved) {
                return res.status(404).send({ message: 'El artista no ha sido eliminado' });
            } else {
                //console.log(artistRemoved);
                Album.find({ artist: artistRemoved._id }).remove((err, albumRemoved) => {
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
                                        return res.status(200).send({ artist: artistRemoved});
                                    }
                                }
                            });
                        }
                    }
                });
                //return res.status(200).send({ artist: artistRemoved });
            }
        }

    });

}

function uploadImage(req,res){
    var artistId = req.params.id;
    var file_name = 'No subido';
    if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];
		//console.log(file_ext);
		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
			
			Artist.findByIdAndUpdate(artistId, {image:file_name}, (err, artitstUpdate) =>{
				if(!artitstUpdate){
					res.status(404).send({message: 'no se ha podido actualizar el artista'});
				}else{
					res.status(200).send({artist:artitstUpdate});
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
	var completeFilePath = './uploads/artists/'+imageFile;
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
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
};