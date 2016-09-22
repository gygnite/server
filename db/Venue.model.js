'use strict';
const Promise = require('bluebird');
const Joi = require('joi');
const knex = require('./knex');
const assign = require('object-assign');
const slug = require('slug');
const randomstring = require('randomstring');
const Timeslots = require('./Timeslots.model');

function Venues() {
    return knex('venues');
}

function validate(venue) {
    return new Promise(function(resolve, reject) {
        resolve(venue);
        //joi validations
        //resolve with venue
        //reject with errors
    });
}

function create(venue) {
    return new Promise(function(resolve, reject) {
        venue = assign({}, venue, {
            slug: createSlug(),
            profile_image: '/assets/venue_avatar.png'
        });
        Venues().insert(venue).returning('*')
            .then(function(newVenue) {
                newVenue = newVenue[0];
                resolve(newVenue);
            })
            .catch(function(err) {
                //reject error occured
                reject(err);
            });
    });
}

function update(slug, venue) {
    return new Promise(function(resolve, reject) {
        venue = updateCreatedAt(venue);
        Bands().where({slug: slug}).update(venue, '*')
        .then(function(updated) {
            updated = updated[0];
            resolve(updated);
        }).catch(reject);
    });
}

function softDelete(slug) {
    return new Promise(function(resolve, reject) {
        Venues().where({slug: slug}).first('*').then(function(venueToUpdate) {
            venueToUpdate = updateDeletedAt(venueToUpdate);
            console.log("venueToUpdate", venueToUpdate)
            return Venues().where({id: venueToUpdate.id}).update(venueToUpdate, '*');
        }).then(function(deleted) {
            resolve(deleted[0]);
        }).catch(reject);
    });
}


function findAllWithLimit(limit, offset) {
    if (!limit || typeof limit !== 'number') {limit = 10000;}
    if (!offset || typeof limit !== 'number') {offset = 0;}
    return new Promise(function(resolve, reject) {
        Venues().limit(limit).offset(offset).then(resolve).catch(reject);
    });
}


function findAll() {
    return new Promise(function(resolve, reject) {
        Venues().where({deleted_at: null}).then(resolve).catch(reject);
    });
}


function findOneBySlug(slug) {
    // FIXME:10 Add Admins Array to output?
    // FIXME: What if band has been deleted?
    return new Promise(function(resolve, reject) {
        Venues().where({slug: slug, deleted_at: null})
        .first('*')
        .then(resolve)
        .catch(reject);
    });
}


function findOneById(id) {
    return new Promise(function(resolve, reject) {
        Venues().where({id: id, deleted_at: null})
        .first('*')
        .then(resolve)
        .catch(reject);
    });
}

function findOneBySlugWithEvents(slug) {
    return new Promise(function(resolve, reject) {
        Venues().where({slug: slug}).first('*')
        .then(function(venue) {
            return Promise.join(
                venue,
                Timeslots.fetchByVenueId(venue.id)
            );
        }).then(function(data) {
            resolve({
                venue: data[0],
                timeslots: data[1],
            });
        }).catch(reject);
    });
}


function updateCreatedAt(venue) {
    return assign({}, venue, {
        updated_at: new Date()
    });
}

function updateDeletedAt(venue) {
    return assign({}, venue, {
        deleted_at: new Date()
    });
}


function createSlug() {
    return randomstring.generate(10).toLowerCase();
}


module.exports = {
    validate: validate,
    create: create,
    update: update,
    softDelete: softDelete,
    findOneBySlug: findOneBySlug,
    findOneById: findOneById,
    findOneBySlugWithEvents: findOneBySlugWithEvents
};
