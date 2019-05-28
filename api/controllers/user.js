'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');


function pruebas(req,res){
	res.status(200).send({
		message: 'probando una accion del controlador de usuarios'
	});

}

function saveUser(req,res){
	var user = new User();

	var params = req.body;

	console.log(params);

	user.name = params.name;
	user.surname = params.surname;
	user.email = params.email;
	user.role = 'RELE_ADMIN';
	user.image = 'null';

	if(params.password){
		//encriptar contraseña y guardar datos.
		bcrypt.hash(params.password,null,null,function(error,hash){
			user.password = hash;
			if(user.name != null && user.surname != null && user.email != null){
				//guarde el user
				user.save((err,userStored) => {
					if(err){ //puede ser que de un error al guardarlo o que no devuelva el user 
							// (que tambien quiere decir que no lo guardo. Esto lo valida abajo)
						res.status(500).send({message: 'Error al guardar el usuario'});
					}else{
						if(!userStored){ // esto es porque si no devuelve el user, puede ser que tambien haya habido un error
							res.status(404).send({message: 'No se ha registrado el usuario'});
						}else{
							res.status(200).send({user:userStored});
						}
					}
				});
			}else{
				res.status(200).send({message: 'Introduce todos los campos'});
			}
		});
	}else{
		res.status(200).send({message: 'Introduce la contraseña'});
	}
}

function loginUser(req,res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email.toLowerCase()},(err,user)=>{
		if(err){
			res.status(500).send({message: 'Error en la peticion'});
		}else{
			if(!user){
				res.status(404).send({message: 'El usuario no existe'});
			}else{
				//comprobar contraseña
				bcrypt.compare(password, user.password, function(err, check){
					if(check){
//						console.log('antes del devolver');
						//devolver los datos del user logeado
						if(params.gethash){
							//devolver un token de jwt
							res.status(200).send({
								token: jwt.createToken(user)
							});
						}else{
							res.status(200).send({user}); //esto es como si pusiera {user: user}
						}
					}else{
						res.status(404).send({message: 'El usuario o contraseña incorrecta'});
					}

				});
			}
		}

	});
}

function updateUser(req,res){
	var userId = req.params.id; //estos llegan por url
	var update = req.body; //esto es el body (del post)

	User.findByIdAndUpdate(userId, update,(err,userUpdate)=>{
		if(err){
			res.status(500).send({message: 'Error al actualizar el usuario'});
		}else{
			if(!userUpdate){
				res.status(404).send({message: 'no se ha podido actualizar el usuario'});
			}else{
				res.status(200).send({user:userUpdate});
			}
		}
	});
}

function uploadImage(req,res){
	var userId = req.params.id;
	var file_name = 'No subido';
	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];
		console.log(file_ext);
		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
			
			User.findByIdAndUpdate(userId, {image:file_name}, (err, userUpdate) =>{
				if(!userUpdate){
					res.status(404).send({message: 'no se ha podido actualizar el usuario'});
				}else{
					res.status(200).send({image:file_name, user:userUpdate});
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
	var completeFilePath = './uploads/users/'+imageFile;
	console.log(completeFilePath);
	fs.exists(completeFilePath,function(exist){
		if(exist){
			res.sendFile(path.resolve(completeFilePath));
		}else{
			res.status(404).send({message: 'No existe la imagen'});	
		}
	});
}

module.exports = {
	pruebas,
	saveUser,
	loginUser,
	updateUser,
	uploadImage,
	getImageFile
};
