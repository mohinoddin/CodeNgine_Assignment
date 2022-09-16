const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    textData:  {
        type: String,
    },
    createdAt: { type: Date, expires: '120', default: Date.now }
});

const dataModal = mongoose.model("data", dataSchema);

module.exports = dataModal;