var mongoose = require('mongoose');

var Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

var hospitalSchema = new Schema({
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
        ref: 'Usuario'
    }
}, {
    collection: 'hospitales'
});

module.exports = mongoose.model('Hospital', hospitalSchema);