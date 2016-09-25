'use strict';

const Promise = require('bluebird');
const knex = require('./knex');

function BandMessages() {
    return knex('band_messages');
}

function VenueMessages() {
    return knex('venue_messages');
}



function createAutogenerated(origin, message) {
    return new Promise(function(resolve, reject) {
        switch (origin) {
            case 'bands':
                BandMessages()
                    .insert(message)
                    .then(function(msg) {
                        resolve(msg[0]);
                    }).catch(reject);
                break;
            case 'venues':
                VenueMessages()
                    .insert(message)
                    .then(function(msg) {
                        resolve(msg[0]);
                    }).catch(reject);
                break;
            default: reject({
                err: "Invalid origin type: " + origin
            });
        }
    });
}

function createNew(message, type) {
    return new Promise(function(resolve, reject) {
        if (type === 'band') {
            BandMessages()
            .insert(message)
            .returning('*').then(function(msg) {
                resolve(msg[0]);
            }).catch(reject);
        } else {
            VenueMessages()
            .insert(message)
            .returning('*').then(function(msg) {
                resolve(msg[0]);
            }).catch(reject);
        }
    });
}


function findBandMessages(id) {
    return BandMessages().where('band_messages.band_id', id)
        .join('venues', 'venues.id', '=', 'band_messages.venue_id')
        .join('bands', 'bands.id', '=', 'band_messages.band_id')
        .fullOuterJoin('timeslots', 'timeslots.id', '=', 'band_messages.timeslot_id')
        .select([
            'band_messages.content as content',
            'band_messages.user_id',
            'band_messages.band_id',
            'band_messages.venue_id',
            'band_messages.date_created',
            'venues.profile_image as venue_image',
            'bands.profile_image as band_image',
            'venues.name as venue_name',
            'venues.slug as venue_slug',
            'bands.name as band_name',
            'bands.slug as band_slug',
            'bands.slug as sender_slug',
            'bands.name as sender_name',
            'band_messages.timeslot_id',
            'timeslots.headliner as isHeadliner',
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
                'venue_messages.date_created',
                'venues.profile_image as venue_image',
                'bands.profile_image as band_image',
                'venues.name as venue_name',
                'venues.slug as venue_slug',
                'bands.name as band_name',
                'bands.slug as band_slug',
                'venues.slug as sender_slug',
                'venues.name as sender_name',
                'venue_messages.timeslot_id',
                'timeslots.headliner as isHeadliner',
                'timeslots.start_time as timeslot_date',
                'timeslots.pending as timeslot_pending',
                'timeslots.accepted as timeslot_accepted',
                'timeslots.rejected as timeslot_rejected'
            ]).from('venue_messages')
            .where('venue_messages.band_id', id)
            .join('venues', 'venues.id', '=', 'venue_messages.venue_id')
            .join('bands', 'bands.id', '=', 'venue_messages.band_id')
            .fullOuterJoin('timeslots', 'timeslots.id', '=', 'venue_messages.timeslot_id');
        }).orderBy('date_created', 'desc');
}

function findVenueMessages(id) {
    return BandMessages().where('band_messages.venue_id', id)
        .join('venues', 'venues.id', '=', 'band_messages.venue_id')
        .join('bands', 'bands.id', '=', 'band_messages.band_id')
        .fullOuterJoin('timeslots', 'timeslots.id', '=', 'band_messages.timeslot_id')
        .select([
            'band_messages.content as content',
            'band_messages.user_id',
            'band_messages.band_id',
            'band_messages.venue_id',
            'band_messages.date_created',
            'venues.profile_image as venue_image',
            'bands.profile_image as band_image',
            'venues.name as venue_name',
            'venues.slug as venue_slug',
            'bands.name as band_name',
            'bands.slug as band_slug',
            'bands.slug as sender_slug',
            'bands.name as sender_name',
            'band_messages.timeslot_id',
            'timeslots.headliner as isHeadliner',
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
                'venue_messages.date_created',
                'venues.profile_image as venue_image',
                'bands.profile_image as band_image',
                'venues.name as venue_name',
                'venues.slug as venue_slug',
                'bands.name as band_name',
                'bands.slug as band_slug',
                'venues.slug as sender_slug',
                'venues.name as sender_name',
                'venue_messages.timeslot_id',
                'timeslots.headliner as isHeadliner',
                'timeslots.start_time as timeslot_date',
                'timeslots.pending as timeslot_pending',
                'timeslots.accepted as timeslot_accepted',
                'timeslots.rejected as timeslot_rejected'
            ]).from('venue_messages')
            .where('venue_messages.venue_id', id)
            .join('venues', 'venues.id', '=', 'venue_messages.venue_id')
            .join('bands', 'bands.id', '=', 'venue_messages.band_id')
            .fullOuterJoin('timeslots', 'timeslots.id', '=', 'venue_messages.timeslot_id')
        }).orderBy('date_created', 'desc')
}


function findOne(id, type) {
    return new Promise(function(resolve, reject) {
        if (type === 'band') {
            BandMessages().where({id: id}).first('*').then(resolve).catch(reject);
        } else {
            VenueMessages().where({id: id}).first('*').then(resolve).catch(reject);
        }
    });
}

function findOneWithData(id, type) {
    return new Promise(function(resolve, reject) {
        if (type === 'band') {
            BandMessages()
            .where({'band_messages.id': id})
            .first('*')
            .join('venues', 'venues.id', '=', 'band_messages.venue_id')
            .join('bands', 'bands.id', '=', 'band_messages.band_id')
            .fullOuterJoin('timeslots', 'timeslots.id', '=', 'band_messages.timeslot_id')
            .select([
                'band_messages.content as content',
                'band_messages.user_id',
                'band_messages.band_id',
                'band_messages.venue_id',
                'band_messages.date_created',
                'venues.profile_image as venue_image',
                'bands.profile_image as band_image',
                'venues.name as venue_name',
                'venues.slug as venue_slug',
                'bands.name as band_name',
                'bands.slug as band_slug',
                'bands.slug as sender_slug',
                'bands.name as sender_name',
                'band_messages.timeslot_id',
                'timeslots.headliner as isHeadliner',
                'timeslots.start_time as timeslot_date',
                'timeslots.pending as timeslot_pending',
                'timeslots.accepted as timeslot_accepted',
                'timeslots.rejected as timeslot_rejected'
            ])
            .then(resolve).catch(reject);
        } else {
            VenueMessages()
            .where({'venue_messages.id': id})
            .first('*')
            .join('venues', 'venues.id', '=', 'venue_messages.venue_id')
            .join('bands', 'bands.id', '=', 'venue_messages.band_id')
            .fullOuterJoin('timeslots', 'timeslots.id', '=', 'venue_messages.timeslot_id')
            .select([
                'venue_messages.content as content',
                'venue_messages.user_id',
                'venue_messages.band_id',
                'venue_messages.venue_id',
                'venue_messages.date_created',
                'venues.profile_image as venue_image',
                'bands.profile_image as band_image',
                'venues.slug as sender_slug',
                'venues.name as sender_name',
                'venues.name as venue_name',
                'venues.slug as venue_slug',
                'bands.name as band_name',
                'bands.slug as band_slug',
                'venue_messages.timeslot_id',
                'timeslots.headliner as isHeadliner',
                'timeslots.start_time as timeslot_date',
                'timeslots.pending as timeslot_pending',
                'timeslots.accepted as timeslot_accepted',
                'timeslots.rejected as timeslot_rejected'
            ])
            .then(resolve).catch(reject);
        }
    });
}


module.exports = {
    createAutogenerated: createAutogenerated,
    createNew: createNew,
    findBandMessages: findBandMessages,
    findVenueMessages: findVenueMessages,
    findOne: findOne,
    findOneWithData: findOneWithData
};