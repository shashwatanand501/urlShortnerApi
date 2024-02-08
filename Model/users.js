// user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    urls: [{ 
        originalUrl: String, 
        shortUrl: String 
    }]
});

const userModel = mongoose.model('User', userSchema);

const urlSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    originalUrl: String,
    shortUrl: String
});

const UrlModel = mongoose.model('Url', urlSchema);

module.exports = { userModel, UrlModel };
