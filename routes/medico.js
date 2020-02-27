var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();
var Medico = require('../models/medico');

//================================================
// Obtener todos los medicos
//================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico',
                        errors: err
                    });
                }

                Medico.count({}, (err, cant) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: cant
                    });

                });
            });
});


//================================================
// Crear nuevo medico
//================================================
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error creando medico.',
                err: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Medico creado satisfactoriamente.',
            medico: medicoGuardado
        });
    });
});


//================================================
// Modificar  medico
//================================================
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe.',
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }
        medico.nombre = body.nombre;
        // medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Medico actualizado correctamente',
                medico: medicoActualizado
            });
        });
    });
});


//================================================
// Eliminar  medico
//================================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el medico a borrar con ese ID.',
                errors: {
                    message: 'No existe el medico a borrar con ese ID.'
                }
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Medico borrado satisfactoriamente',
            medico: medicoBorrado
        });
    });
});

module.exports = app;