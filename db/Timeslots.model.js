'use strict';
const Promise = require('bluebird');
const knex = require('./knex');
const moment = require('moment');

function Timeslots() {
    return knex('timeslots');
}

function fetchById(id) {
    return new Promise(function(resolve, reject) {
        Timeslots().where({id: id}).first('*')
        .then(function(timeslot) {
            resolve(timeslot);
        }).catch(reject);
    });
}

function findRelatedTimelots(timeslot) {
    return new Promise(function(resolve, reject) {
        var date = moment(timeslot.start_time).format("MM-DD-YYYY");
        var dateFloor = new Date(date);
        var dateMax = moment(dateFloor).add(23.99, 'hours');
        Timeslots()
            .whereBetween('start_time', [dateFloor, dateMax])
            .andWhere({venue_id: timeslot.venue_id, venue_booking: false})
            .join('bands', 'bands.id', 'timeslots.band_id')
            .join('venues', 'venues.id', 'timeslots.venue_id')
            .select([
                'timeslots.start_time as start_time',
                'timeslots.end_time as end_time',
                'timeslots.origin_id as origin_id',
                'timeslots.venue_id as venue_id',
                'timeslots.band_id as band_id',
                'timeslots.event_link as event_link',
                'timeslots.facebook_link as facebook_link',
                'timeslots.venue_booking as venue_booking',
                'timeslots.headliner as headliner',
                'timeslots.pending as pending',
                'timeslots.accepted as accepted',
                'timeslots.rejected as rejected',
                'timeslots.created_at as timeslot_created_at',
                'timeslots.deleted_at as timeslot_deleted_at',
                'venues.name as venue_name',
                'venues.slug as venue_slug',
                'venues.profile_image as venue_image',
                'bands.name as band_name',
                'bands.slug as band_slug',
                'bands.profile_image as band_image'
            ])
        .then(function(related) {
            related = related.map(function(r, i) {
                return {
                    data: {
                        start_time: r.start_time,
                        end_time: r.end_time,
                        origin_id: r.origin_id,
                        venue_id: r.venue_id,
                        band_id: r.band_id,
                        event_link: r.event_link,
                        facebook_link: r.facebook_link,
                        venue_booking: r.venue_booking,
                        headliner: r.headliner,
                        pending: r.pending,
                        accepted: r.accepted,
                        rejected: r.rejected
                    },
                    venue: {
                        id: r.venue_id,
                        name: r.venue_name,
                        slug: r.venue_slug,
                        image: r.venue_image
                    },
                    band: {
                        id: r.band_id,
                        name: r.band_name,
                        slug: r.band_slug,
                        image: r.band_image
                    }
                }
            });
            resolve(related);
        }).catch(reject);
    });
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


function updateAcceptedRejected(status, venue_id, band_id, date) {
    return new Promise(function(resolve, reject) {
        Timeslots().where({
            venue_id: venue_id,
            band_id: band_id,
            start_time: date
        })
        .update({
            pending: false,
            accepted: (status === 'accepted'),
            rejected: (status === 'rejected')
        }).returning('*')
        .then(function(updated) {
            resolve(updated[0]);
        }).catch(reject);
    });
}


module.exports = {
    findRelatedTimelots: findRelatedTimelots,
    fetchById: fetchById,
    fetchByBandId: fetchByBandId,
    fetchByVenueId: fetchByVenueId,
    create: create,
    updateAcceptedRejected: updateAcceptedRejected
};
