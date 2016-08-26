'use strict';
const db = require('./mongoose.config');

const UserSchema = db.Schema({
    email: String,
    password: {type: String, select: false},
    first_name: String,
    last_name: String
});

UserSchema.methods.getUser = function() {
    console.log("user data method: ", this);
    return this;
};


const User = db.model('User', UserSchema);


module.exports = User;
