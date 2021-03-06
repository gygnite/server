'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const Message = require('../db/Message.model');
const Timeslots = require('../db/Timeslots.model');
const knex = require('../db/knex');
const Admin = require('../db/Admin.model');



router.post('/', function(req, res) {
    var userId = req.user.id;
    var details = req.body;

    var sender = req.query.sender;
    var receiver = req.query.receiver;
    var originType = req.query.originType;

    Timeslots.create(details, userId)
    .then(sendAutogeneratedMessage)
    .then(getMessageDetails)
    .then(function(data) {

        //created successfully!
        res.status(200).json({
            timeslot: data[0],
            message: data[1],
            success: true
        });

    }).catch(function(err) {
        res.throwClientError('An error occurred while saving booking.');
    });


    function sendAutogeneratedMessage(timeslot) {
        var message = {
            user_id: userId,
            content: details.message,
            timeslot_id: timeslot.id
        };
        if (originType === 'bands') {
            message.band_id = sender,
            message.venue_id = receiver
        } else {
            message.venue_id = sender,
            message.band_id = receiver
        }

        return Promise.join(
            timeslot,
            Message.createAutogenerated(originType, message)
        );
    }


    function getMessageDetails(data) {
        var timeslot = data[0];
        var message = data[1];
        var type = originType.substring(0, originType.length - 1);

        return Promise.join(
            timeslot,
            Message.findOneWithData(message.id, type)
        );
    }

});


router.get('/', function(req, res) {
    var user = req.user;
    var bands = [];
    var venues = [];
    var pending = true;
    var rejected = null;
    Promise.join(
        Admin.findAllBandsByAdmin(user.id),
        Admin.findAllVenuesByAdmin(user.id)
    ).then(function(adminData) {
        bands = adminData[0];
        venues = adminData[1];

        var bandSlots = [];
        var venueSlots = [];

        for (let i = 0; i < bands.length; i++) {
            bandSlots.push(Timeslots.fetchByBandIdWithData(bands[i].id, pending, rejected));
        }

        for (let i = 0; i < venues.length; i++) {
            venueSlots.push(Timeslots.fetchByVenueIdWithData(venues[i].id, pending, rejected));
        }

        return Promise.join(
            Promise.all(bandSlots),
            Promise.all(venueSlots)
        );

    }).then(function(tss) {

        var bandSlots = tss[0];
        var venueSlots = tss[1];
        var bandTimes = [];
        var venueTimes = [];

        bandSlots.forEach(function(ent) {
             ent.forEach(function(t) {
                bandTimes.push(t);
            });
        });

        venueSlots.forEach(function(ent) {
             ent.forEach(function(t) {
                venueTimes.push(t);
            });
        });

        bandTimes = bandTimes.sort(sortByDate);
        venueTimes = venueTimes.sort(sortByDate);


        var bands = {};
        bandTimes.forEach(function(slot) {
            if (!bands.hasOwnProperty(slot.band.slug)) {
                bands[slot.band.slug] = {
                    identity: slot.band,
                    slots: []
                };
            }
            bands[slot.band.slug].slots.push(slot);
        });

        var venues = {};
        venueTimes.forEach(function(slot) {
            if (!venues.hasOwnProperty(slot.venue.slug)) {
                venues[slot.venue.slug] = {
                    identity: slot.venue,
                    slots: []
                };
            }
            venues[slot.venue.slug].slots.push(slot);
        });


        var bandIds = [];
        for (let ent in bands) {
            bandIds.push(bands[ent]);
        }
        var venueIds = [];
        for (let ent in venues) {
            venueIds.push(venues[ent]);
        }

        res.json({
            bands: bandIds,
            venues: venueIds
        });
    }).catch(function(err) {
        res.throwClientError('Unable to load bookings.');
    });
});


router.get('/venue/:slug', function(req, res) {
    var user = req.user;
    knex('venues').where({slug: req.params.slug})
        .first('*')
        .then(function(venue) {
            return Promise.join(
                venue,
                knex('timeslots')
                    .where({venue_id: venue.id})
                    .join('bands', 'bands.id', '=', 'timeslots.band_id')
                    .orderBy('start_time', 'desc')
            );
        }).then(function(data) {
            res.json({
                venue: data[0],
                timeslots: data[1]
            });
        }).catch(function(err) {
            res.throwClientError('An error occurred while loading venue bookings.');
        });
});


router.get('/date/:id', function(req, res) {
    var user = req.user;

    // FIXME: Check timeslot authentication
    //check if user has authentication to view and access booking

    Timeslots.fetchById(req.params.id)
        .then(function(timeslot) {
            Timeslots.findRelatedTimelots(timeslot).then(function(related) {
                res.json({
                    success: true,
                    timeslots: related
                });
            });
        }).catch(function(err) {
            res.throwClientError('Unable to load booking.');
        });
});


router.put('/:vid/:bid', function(req, res) {
    var bandId = req.params.bid;
    var venueId = req.params.vid;
    var status = req.body.status;
    var date = req.body.date;
    console.log("body", req.body)
    if (status === 'accepted' || status === 'rejected') {
        Timeslots.updateAcceptedRejected(status, venueId, bandId, date)
        .then(function(updated) {
            res.json({
                timeslot: updated
            });
        }).catch(function(err) {
            res.throwClientError('An error occurred while updating booking.');
        });
    }
});



module.exports = router;




function sortByDate(a, b) {
    return new Date(a.data.start_time) - new Date(b.data.start_time);
}
