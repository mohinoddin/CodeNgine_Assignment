const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:  {
        type: String,
    },
    email: {
        type: String,
        
    },
    password:String,
});

const userModal = mongoose.model("user", userSchema);

module.exports = userModal;