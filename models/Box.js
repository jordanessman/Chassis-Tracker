const mongoose = require ('mongoose');

const boxSchema = new mongoose.Schema ({
    box: {
        type: String,
        required: true
    },
    box2: {
        type: String,
    },
    boxType: {
        type: String,
        required: true
    },
    carrier: {
        type: String,
        required: true
    },
    driver: {
        type: String,
        required: true
    },
    truckNum: {
        type: String,
        required: true
    },
    chass: {
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
    returnTruckNum: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true
    },
    completionSubTime: {
        type: String,
    }
})


const Box = mongoose.model('Box', boxSchema);

module.exports = Box;