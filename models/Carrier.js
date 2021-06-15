const mongoose = require ('mongoose');

const carrierSchema = new mongoose.Schema ({
    carrier: {
        type: String,
        required: true
    },
    boxCount: {
        type: String,
    },
    chassCount: {
        type: String,
    },
    password: {
        type: String,
        required: true
    }
})


const Carrier = mongoose.model('Carrier', carrierSchema);

module.exports = Carrier;