'use strict';

const router = require('express').Router();

const users = require('./users');
const admins = require('./admins');
const booking = require('./booking');
const messages = require('./messages');

router.use('/users', users);
router.use('/admins', admins);
router.use('/booking', booking);
router.use('/messages', messages);

module.exports = router;
