'use strict';

const router = require('express').Router();
const Venues = require('../db/Venue.model');



router.get('/:slug', function(req, res) {

    Venues.findOneBySlugWithEvents(req.params.slug)
    .then(function(venue) {
        var returnVenue = venue.venue;
        returnVenue.timeslots = venue.timeslots;
        res.json({
            venue: returnVenue
        });
    }).catch(function(err) {
        res.throwClientError('An error occurred while finding this venue.');
    });


});






module.exports = router;
