const mongoose = require('mongoose');

const resetSchema = mongoose.Schema(
    {
    id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
    }, 
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Reset', resetSchema);