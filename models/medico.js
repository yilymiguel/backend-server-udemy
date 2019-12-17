var mongoose = require('mongoose');

var Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

var medicolSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    img: {
        type: String,
        required: false
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'El hospital es un campo obligatorio.']
    }
});

module.exports = mongoose.model('Medico', medicolSchema);