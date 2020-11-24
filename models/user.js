const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const user = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        immutable: true
    },
    password: {
        type: String, 
        required: true
    },
    creation_stamp: {
        type: Date,
        required: true,
        immutable: true
    },
    role: {
        type: 'String',
        required: true,
        enum: ['admin', 'subadmin', 'tourist']
    },
    access: [{ type : ObjectId, ref: 'User' }],
})

mongoose.model('User', user)