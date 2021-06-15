const mongoose = require ('mongoose');

const chassisSchema = new mongoose.Schema ({
    chass: {
        type: String,
        required: true
    },
    chassType: {
        type: String,
        required: true
    },
    pickupDate: {
        type: String,
        required: true
    },
    pickupDriver: {
        type: String,
    },
    returnDate: {
        type: String,
    },
    returnDriver: {
        type: String,
    },
    leaseStatus: {
        type: Boolean,
        required: true
    },
    tagged: {
        type: Boolean,
    },
    status: {
        type: Boolean,
        required: true
    }
})


const Chass = mongoose.model('Chassis', chassisSchema);

module.exports = Chass;