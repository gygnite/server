'use strict';

const router = require('express').Router();
const Venues = require('../db/Venue.model');



router.get('/:slug', function(req, res) {

    Venues.findOneBySlugWithEvents(req.params.slug)
    .then(function(venue) {
        console.log("timeslots", venue.timeslots);
        var returnVenue = venue.venue;
        returnVenue.timeslots = venue.timeslots;
        res.json({
            venue: returnVenue
        });
    }).catch(function(err) {
        // FIXME: handle error!
        console.error(err);
    });


});






module.exports = router;
