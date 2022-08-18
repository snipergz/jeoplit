const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username value cannot be missing"],
            unique: true
        },
        email: {
            type: String,
            required: [true, "Email value cannot be missing"]
        },
        password: {
            type: String,
            required: [true, "Password value cannot be missing"]
        }
    }, 
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('User', userSchema);