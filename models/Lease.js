const mongoose = require ('mongoose');

const leaseSchema = new mongoose.Schema ({
    chass: {
        type: String,
        required: true
    },
    chassType: {
        type: String,
        required: true
    },
    VINNumber: {
        type: String,
    },
    carrier: {
        type: String,
    },
    driver: {
        type: String,
    },
    truckNum: {
        type: String,
    },
    pickupDate: {
        type: String,
        required: true
    },
    pickupTime: {
        type: String,
        required: true
    },
    returnDate: {
        type: String,
    },
    returnTime: {
        type: String,
    },
    returnDriver: {
        type: String,
    },
    returnTruckNum: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true
    },
    completionSubTime: {
        type: String,
    },
    picture: {
        type: String,
    }
})


const Lease = mongoose.model('Lease', leaseSchema);

module.exports = Lease;