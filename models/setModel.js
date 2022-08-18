const mongoose = require('mongoose');

const setSchema = mongoose.Schema(
    {
        title: {
            type: String
        },
        link: {
            type: String
        },
        questions: {
            type: String
        },
        answers: {
            type: String
        }

    }
)

module.exports = mongoose.model('Set', setSchema);