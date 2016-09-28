'use strict';

const router = require('express').Router();
const Bands = require('../db/Band.model');

/**
    All Bands (user doesn't need to be authenticated)
*/

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
            res.throwClientError('Unable to load band.');
        });
});





module.exports = router;
