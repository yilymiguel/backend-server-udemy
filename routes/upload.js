var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


//default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de carpeta a guardar
    var tiposValids = ['hospitales', 'medicos', 'usuarios'];


    if (tiposValids.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion o tabla no valida.',
            errors: {
                message: 'Tipo de coleccion o tabla no valida.'
            }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado nada para subir.',
            errors: {
                message: 'Debe seleccionar una imagen.'
            }
        });
    }


    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var splitName = archivo.name.split('.');
    var ext = splitName[splitName.length - 1];


    //Solo se aceptan estas Ext
    var extValid = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'];


    if (extValid.indexOf(ext) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: {
                message: 'Las extensiones validas son: ' + extValid.join(', ')
            }
        });
    }

    //nombre de archivo personalizado
    var fileName = `${id}-${new Date().getMilliseconds()}.${ext}`;


    //Mover el archivo del temp a su carpeta respectiva
    var path = `./uploads/${tipo}/${fileName}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, fileName, res);
    });
});


function subirPorTipo(tipo, id, fileName, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario con ese ID.',
                    errors: err
                });
            }


            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe.',
                    errors: {
                        message: 'Usuario no existe.'
                    }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //si existe elimina la img anterior 
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }


            usuario.img = fileName;

            usuario.save((err, usuarioAct) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se pudo guardar el usuario.',
                        errors: err
                    });
                }

                usuarioAct.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo subido correctamente.',
                    usuario: usuarioAct
                });
            })

        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el medico con ese ID.',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe.',
                    errors: {
                        message: 'Medico no existe.'
                    }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //si existe la imagen la borro
            // if (fs.existsSync(pathViejo)) {
            // fs.unlink(pathViejo);
            // }

            medico.img = fileName;

            medico.save((err, medicoAct) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se pudo guardar el medico.',
                        errors: err
                    });
                }


                return res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo subido correctamente.',
                    medico: medicoAct
                });

            });
        });
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital con ese ID.',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe.',
                    errors: {
                        message: 'Hospital no existe.'
                    }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //si existe la imagen la borro
            // if (fs.existsSync(pathViejo)) {
            // fs.unlink(pathViejo);
            // }

            hospital.img = fileName;

            hospital.save((err, hospitalAct) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se pudo guardar el hospital.',
                        errors: err
                    });
                }


                return res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo subido correctamente.',
                    medico: hospitalAct
                });

            });
        });

    }
}
module.exports = app;