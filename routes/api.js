'use strict';

const router = require('express').Router();

const users = require('./users');
const admins = require('./admins');
const bands = require('./bands');
const venues = require('./venues');

router.use('/users', users);
router.use('/admin', admin);
router.use('/bands', bands);
router.use('/venues', venues);

module.exports = router;
