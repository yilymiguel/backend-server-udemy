var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAuth = require('../middlewares/auth');

var app = express();
var Usuario = require('../models/usuario');

//================================================
// Obtener todos los usuarios
//================================================
app.get('/', (req, res, next) => {

    //obtener todos los usuarios
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuraios: usuarios
                });
            });
});




//================================================
// Crear nuevo usuario
//================================================
app.post('/', mdAuth.verificaToken, (req, res) => {

    var body = req.body;

    var usuraio = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuraio.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando el usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado satisfactoriamente',
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });


});


//================================================
// Modificar usuario
//================================================
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe.',
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                mensaje: 'Usuario actualizado correctamente',
                usuario: usuarioGuardado
            });
        })
    })
});


//================================================
// Eliminar usuario
//================================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario a borrar con ese ID.',
                errors: {
                    message: 'No existe el usuario a borrar con ese ID.'
                }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Usuario eliminado correctamente',
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;