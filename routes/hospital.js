var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();
var Hospital = require('../models/hospital');

//================================================
// Obtener todos los hospitales
//================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }

                Hospital.count({}, (err, cant) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: cant
                    });
                });

            });
});


//================================================
// Crear nuevo hospital
//================================================
app.post('/', mdAuth.verificaToken,
    (req, res) => {
        var body = req.body;

        var hospital = new Hospital({
            nombre: body.nombre,
            img: body.img,
            usuario: req.usuario._id
        });

        hospital.save((err, hospitaGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error creando hospital.',
                    err: err
                });
            }

            res.status(201).json({
                ok: true,
                mensaje: 'Hospital creado satisfactoriamente.',
                hospital: hospitaGuardado
            });
        });
    });


//================================================
// Modificar  hospital
//================================================
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + ' no existe.',
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }
        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Hospital actualizado correctamente',
                hospital: hospitalActualizado
            });
        });
    });
});


//================================================
// Eliminar  hospital
//================================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital a borrar con ese ID.',
                errors: {
                    message: 'No existe el hospital a borrar con ese ID.'
                }
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Hospital borrado satisfactoriamente',
            hospital: hospitalBorrado
        });
    });
});


//================================================
// Obtener  hospital por ID
//================================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe.',
                    errors: {
                        message: 'No existe el hospital con ese ID.'
                    }
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
});

module.exports = app;