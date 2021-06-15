const mongoose = require ('mongoose');

const repairSchema = new mongoose.Schema ({
    chass: {
        type: String,
        required: true
    },
    chassType: {
        type: String,
        required: true
    },
    repairRequestDate: {
        type: String,
        required: true
    },
    repairItem: {
        type: String,
        required: true
    },
    notes: {
        type: String,
    },
    mechanic: {
        type: String,
    },
    repairDate: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true
    }
})


const repair = mongoose.model('Repair', repairSchema);

module.exports = repair;