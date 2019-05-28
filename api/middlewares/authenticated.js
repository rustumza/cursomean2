'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_curso';

exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorizarion){
        return res.status(403).send({message: 'La petición no tiene la cabecera de autenticación'});
    }

    var token = req.headers.authorizarion.replace(/['"]+/g, '');

    try{
        var payload = jwt.decode(token, secret);

        if(payload.exp < moment().unix() ){
            console.log('Token ha expirado');
            return res.status(404).send({message: 'Token ha expirado'});
        }
    }catch(ex){
        console.log(ex);
        return res.status(404).send({message: 'Token inválido'});
    }

    //seteo el user en el req para que ya lo tenga en todos los metodos y no tenga que andar buscandolo o decodificando el token
    req.user = payload;

    // llamo a next() para que continue con el siguiente metodo (este next es el que recibo por parametro)
    next();
};