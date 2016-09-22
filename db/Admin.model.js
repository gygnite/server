'use strict';

const Promise = require('bluebird');
const knex = require('./knex');

function BandAdmins() {
    return knex('band_admins');
}

function VenueAdmins() {
    return knex('venue_admins');
}


function fetchAdminDetails(id) {
    return new Promise(function(resolve, reject) {
        //send back admin details?
    });
}


function addAdminToBand(bandId, userId) {
    return new Promise(function(resolve, reject) {
        BandAdmins().insert({
            band_id: bandId,
            user_id: userId
        }).returning('*')
        .then(function(newAdmin) {
            newAdmin = newAdmin[0];
            resolve(newAdmin);
        }).catch(reject);
    });
}


function addAdminToVenue(venueId, userId) {
    return new Promise(function(resolve, reject) {
        VenueAdmins().insert({
            venue_id: venueId,
            user_id: userId
        }).returning('*')
        .then(function(newAdmin) {
            newAdmin = newAdmin[0];
            resolve(newAdmin)
        }).catch(reject);
    });
}


function findAllBandsByAdmin(id) {
    return new Promise(function(resolve, reject) {
        BandAdmins().where({user_id: id})
            .join('bands', 'bands.id', 'band_admins.band_id')
            .select('*').where('bands.deleted_at', null)
            .then(resolve)
            .catch(reject);
    });
}


function findAllVenuesByAdmin(id) {
    return new Promise(function(resolve, reject) {
        VenueAdmins().where({user_id: id})
            .join('venues', 'venues.id', '=', 'venue_admins.venue_id')
            .select('*').where('venues.deleted_at', null)
            .then(resolve)
            .catch(reject);
    });
}







module.exports = {
    addAdminToBand: addAdminToBand,
    addAdminToVenue: addAdminToVenue,
    findAllBandsByAdmin: findAllBandsByAdmin,
    findAllVenuesByAdmin: findAllVenuesByAdmin
};
