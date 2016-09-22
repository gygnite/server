'use strict';

const router = require('express').Router();
const Bands = require('../db/Band.model');

/**
    All Bands
*/
router.get('/', function(req,res) {
    //fetch from users table all records with user id
    //map through
});


router.get('/:slug', function(req, res) {
    Bands.findOneBySlugWithEvents(req.params.slug)
        .then(function(band) {
            var returnBand = band.band;
            returnBand.timeslots = band.timeslots;
            returnBand.genres = band.genres;
            res.json({
                band: returnBand
            });
        }).catch(function(err) {
            console.log("err", err);
        });
});





module.exports = router;
