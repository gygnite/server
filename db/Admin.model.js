'use strict';
const db = require('./mongoose.config');
const randomstring = require('randomstring');

const AdminSchema = db.Schema({
    user_id: {
        type: String,
        required: true
    },
    artist_id: String,
    venue_id: String,
    created_at: {type: Date, default: Date.now},
    deleted_at: {type: Date, default: null}
});



const Admin = db.model('Admin', AdminSchema);


module.exports = Admin;
