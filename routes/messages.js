'use strict';

const router = require('express').Router();
const knex = require('../db/knex');
const Admin = require('../db/Admin.model');
const Message = require('../db/Message.model');
const Promise = require('bluebird');


router.get('/', function(req, res) {
    Promise.join(
        Admin.findAllVenuesByAdmin(req.user.id),
        Admin.findAllBandsByAdmin(req.user.id)
    ).then(function(data) {
        var venues = data[0].map(function(v, i) {
            return Promise.join(
                {id: v.id, slug: v.slug, type: 'venue', name: v.name},
                findVenueMessages(v.id)
            );
        });
        var bands = data[1].map(function(b, i) {
            return Promise.join(
                {id: b.id, slug: b.slug, type: 'band', name: b.name},
                findBandMessages(b.id)
            );
        });

        return Promise.join(
            Promise.all(venues),
            Promise.all(bands)
        );

    }).then(function(data) {
        var venuesAndBands = data[0].concat(data[1]);
        var groups = venuesAndBands.map(function(v, i) {
            var identity = v[0];
            var allMsgs = v[1];
            var msgGroups = {};
            allMsgs.forEach(function(msg) {
                //check type of id,
                    //if type is band, group by venue_id
                    //if type is venue, group messages by band_id
                var type = (identity.type === 'band') ? 'venue' : 'band';

                if (!msgGroups.hasOwnProperty(msg[type+'_slug'])) {
                    //if the message group does not have a group for the id chosen
                    msgGroups[msg[type+'_slug']] = {
                        identity: {
                            type: type,
                            slug: msg[type+'_slug'],
                            name: msg[type+'_name']
                        },
                        messages: []
                    };
                }
                console.log("msg[type+'_slug']: ", msg[identity.type+'_slug'], identity.slug)
                msgGroups[msg[type+'_slug']].messages.push(msg);
            });
            return {
                identity: identity,
                messageGroups: msgGroups
            }
        });

        res.json({
            success: true,
            data: groups
        });
    }).catch(function(err) {
        // FIXME: Unable to fetch messages
        console.error('unable to fetch messages: ', err);
        res.json({
            success: false,
            data: {},
            message: 'Unable to fetch messages'
        });
    });




    function findVenueMessages(id) {
        return knex('band_messages').where('band_messages.venue_id', id)
            .join('venues', 'venues.id', '=', 'band_messages.venue_id')
            .join('bands', 'bands.id', '=', 'band_messages.band_id')
            .fullOuterJoin('timeslots', 'timeslots.id', '=', 'band_messages.timeslot_id')
            .select([
                'band_messages.content as content',
                'band_messages.user_id',
                'band_messages.band_id',
                'band_messages.venue_id',
                'band_messages.timeslot_id',
                'band_messages.date_created',
                'venues.name as venue_name',
                'venues.slug as venue_slug',
                'bands.name as band_name',
                'bands.slug as band_slug',
                'bands.slug as sender_slug',
                'bands.name as sender_name',
                'timeslots.start_time as timeslot_date',
                'timeslots.pending as timeslot_pending',
                'timeslots.accepted as timeslot_accepted',
                'timeslots.rejected as timeslot_rejected'
            ])
            .unionAll(function() {
                this.select([
                    'venue_messages.content as content',
                    'venue_messages.user_id',
                    'venue_messages.band_id',
                    'venue_messages.venue_id',
                    'venue_messages.timeslot_id',
                    'venue_messages.date_created',
                    'venues.name as venue_name',
                    'venues.slug as venue_slug',
                    'bands.name as band_name',
                    'bands.slug as band_slug',
                    'venues.slug as sender_slug',
                    'venues.name as sender_name',
                    'timeslots.start_time as timeslot_date',
                    'timeslots.pending as timeslot_pending',
                    'timeslots.accepted as timeslot_accepted',
                    'timeslots.rejected as timeslot_rejected'
                ]).from('venue_messages')
                .where('venue_messages.venue_id', id)
                .join('venues', 'venues.id', '=', 'venue_messages.venue_id')
                .join('bands', 'bands.id', '=', 'venue_messages.band_id')
                .fullOuterJoin('timeslots', 'timeslots.id', '=', 'venue_messages.timeslot_id')
            }).orderBy('date_created', 'asc')
    }

    function findBandMessages(id) {
        return knex('band_messages').where('band_messages.band_id', id)
            .join('venues', 'venues.id', '=', 'band_messages.venue_id')
            .join('bands', 'bands.id', '=', 'band_messages.band_id')
            .fullOuterJoin('timeslots', 'timeslots.id', '=', 'band_messages.timeslot_id')
            .select([
                'band_messages.content as content',
                'band_messages.user_id',
                'band_messages.band_id',
                'band_messages.venue_id',
                'band_messages.timeslot_id',
                'band_messages.date_created',
                'venues.name as venue_name',
                'venues.slug as venue_slug',
                'bands.name as band_name',
                'bands.slug as band_slug',
                'bands.slug as sender_slug',
                'bands.name as sender_name',
                'timeslots.start_time as timeslot_date',
                'timeslots.pending as timeslot_pending',
                'timeslots.accepted as timeslot_accepted',
                'timeslots.rejected as timeslot_rejected'
            ])
            .union(function() {
                this.select([
                    'venue_messages.content as content',
                    'venue_messages.user_id',
                    'venue_messages.band_id',
                    'venue_messages.venue_id',
                    'venue_messages.timeslot_id',
                    'venue_messages.date_created',
                    'venues.name as venue_name',
                    'venues.slug as venue_slug',
                    'bands.name as band_name',
                    'bands.slug as band_slug',
                    'venues.slug as sender_slug',
                    'venues.name as sender_name',
                    'timeslots.start_time as timeslot_date',
                    'timeslots.pending as timeslot_pending',
                    'timeslots.accepted as timeslot_accepted',
                    'timeslots.rejected as timeslot_rejected'
                ]).from('venue_messages')
                .where('venue_messages.band_id', id)
                .join('venues', 'venues.id', '=', 'venue_messages.venue_id')
                .join('bands', 'bands.id', '=', 'venue_messages.band_id')
                .fullOuterJoin('timeslots', 'timeslots.id', '=', 'venue_messages.timeslot_id');
            }).orderBy('date_created', 'asc');
    }
});


router.get('/bands/:id', function(req, res) {
    //all messages for band
});


router.get('/venues/:id', function(req, res) {
    //all messages for venue
});






module.exports = router;
