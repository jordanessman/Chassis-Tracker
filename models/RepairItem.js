const mongoose = require ('mongoose');

const RepairItemSchema = new mongoose.Schema ({
    repairItem: {
        type: String,
        required: true
    }
})


const repairItem = mongoose.model('RepairItem', RepairItemSchema);

module.exports = repairItem;