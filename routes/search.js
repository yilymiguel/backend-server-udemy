var express = require('express');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();


//=======================================================
// Busqueda especifica por coleccion o tabla
//=======================================================
app.get('/coleccion/:tabla/:search', (req, res) => {

    var tabla = req.params.tabla;
    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    var promesa;

    switch (tabla) {
        case 'medicos':
            promesa = searchMedicos(search, regex);
            break;

        case 'hospitales':
            promesa = searchHospitales(search, regex);
            break;

        case 'usuarios':
            promesa = searchUsuarios(search, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos, hospitales',
                errors: {
                    message: 'Tipo de tabla/coleccion no valido.'
                }
            });
    }

    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});


//=======================================================
// Busqueda general
//=======================================================
app.get('/todo/:search', (req, res) => {

    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    Promise.all([
            searchHospitales(search, regex),
            searchMedicos(search, regex),
            searchUsuarios(search, regex)
        ])
        .then(respuesta => {

            res.status(200).json({
                ok: true,
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuarios: respuesta[2]
            });
        });

});

//=======================================================
// Promesa buscador en hospitales
//=======================================================
function searchHospitales(search, regex) {
    return new Promise((resolve, reject) => {

        Hospital.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email')
            .exec(
                (err, hospitales) => {

                    if (err) {
                        reject('Error al cargar hospitales', err);
                    } else {
                        resolve(hospitales);
                    }
                });
    });
}

//=======================================================
// Promesa buscador en medicos
//=======================================================

function searchMedicos(search, regex) {
    return new Promise((resolve, reject) => {

        Medico.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}


//=======================================================
// Promesa buscador en usuarios por dos columnas: Nombre y Email
//=======================================================
function searchUsuarios(search, regex) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{
                'nombre': regex
            }, {
                'email': regex
            }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err)
                } else {
                    resolve(usuarios);
                }
            });

    });
}


module.exports = app;