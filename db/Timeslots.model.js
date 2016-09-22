'use strict';
const Promise = require('bluebird');
const knex = require('./knex');

function Timeslots() {
    return knex('timeslots');
}

function fetchByBandId(band_id) {
    return new Promise(function(resolve, reject) {
        Timeslots().where({band_id: band_id})
        .join('venues', 'venues.id', 'timeslots.venue_id')
        .then(function(ts) {
            resolve(ts);
        }).catch(reject);
    });
}

function fetchByVenueId(venue_id) {
    return new Promise(function(resolve, reject) {
        Timeslots()
            .where({venue_id: venue_id, pending: false, accepted: true})
            .orWhere({venue_id: venue_id, pending: true})
        .join('bands', 'bands.id', 'timeslots.band_id')
        .then(function(ts) {
            resolve(ts);
        }).catch(reject);
    });
}


function create(details, user_id) {
    return new Promise(function(resolve, reject) {
        console.log("new Date(details.date)", new Date(details.date));
        Timeslots().insert({
            start_time: new Date(details.date),
            end_time: new Date(details.date),
            origin_id: user_id,
            venue_id: details.venue,
            band_id: details.band,
            headliner: details.headliner || false,
            pending: true,
            accepted: null,
            rejected: null
        }).returning('*')
        .then(function(newTs) {
            newTs = newTs[0];
            resolve(newTs);
        }).catch(reject);
    });
}


module.exports = {
    fetchByBandId: fetchByBandId,
    fetchByVenueId: fetchByVenueId,
    create: create
};
