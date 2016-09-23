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

function createNew(message, origin) {
    return new Promise(function(resolve, reject) {
        if (origin === 'band') {
            BandMessages().insert(message).first('*').then(resolve).catch(reject);
        } else {
            VenueMessages().insert(message).first('*').then(resolve).catch(reject);
        }
    });
}



module.exports = {
    createAutogenerated: createAutogenerated
};
