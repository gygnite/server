'use strict';

const router = require('express').Router();

const users = require('./users');
const admins = require('./admins');
const booking = require('./booking');
const messages = require('./messages');

module.exports = function(io) {

    router.use('/users', users);
    router.use('/admins', admins(io));
    router.use('/booking', booking);
    router.use('/messages', messages(io));

    return router;
};
// module.exports = router;
