const mongoose = require('mongoose')

/* 
    Template object
    Provided just because users always need
    some objects they have ownership over
*/
const templObjSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const TemplObj = mongoose.model('TemplObj', templObjSchema)

module.exports = TemplObj