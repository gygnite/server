'use strict';

const router = require('express').Router();


router.get('/', function(req, res) {
    var user = req.user;
    var userId = req.user._id;
    /*
        return all admin data
            -> bands
            -> venues
            -> settings?
    */
});


/**
* Admin Band Routes
    -> Used for admin related band events,
        -> add new admin
        -> edit band info
        -> create new band
        -> delete bands
*/

router.get('/bands', function(req, res) {
    //
});

router.get('/bands/:slug', function(req, res) {

});

router.post('/bands/:slug', function(req, res) {

});

router.put('/bands/:slug', function(req, res) {

});

router.delete('/bands/:slug', function(req, res) {

});





/**
* Admin Venue Routes
    -> Used for admin related venue events,
        -> add new admin
        -> edit venue info
        -> create new venue
        -> delete venues
*/


router.get('/venues', function(req, res) {

});

router.get('/venues/:slug', function(req, res) {

});

router.post('/venues/:slug', function(req, res) {

});

router.put('/venues/:slug', function(req, res) {

});

router.delete('/venues/:slug', function(req, res) {

});




module.exports = router;
