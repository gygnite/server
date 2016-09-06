'use strict';
const db = require('./mongoose.config');
const randomstring = require('randomstring');

const UserSchema = db.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {type: String, select: false},
    first_name: String,
    last_name: String,
    created_at: {type: Date, default: Date.now},
    deleted_at: {type: Date, default: null},
    activation_code: {type: String, default: randomstring.generate()}
});

UserSchema.methods.getUser = function() {
    console.log("user data method: ", this);
    return this;
};


const User = db.model('User', UserSchema);


module.exports = User;
