'use strict';

const router = require('express').Router();



router.get('/', function(req, res) {
    //load all user messages
});


router.get('/bands/:id', function(req, res) {
    //all messages for band
});


router.get('/venues/:id', function(req, res) {
    //all messages for venue
});






module.exports = router;
