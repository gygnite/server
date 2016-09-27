'use strict';
const Promise = require('bluebird');
const Joi = require('joi');
const knex = require('./knex');
const assign = require('object-assign');
const slug = require('slug');
const randomstring = require('randomstring');
const Timeslots = require('./Timeslots.model');

function Bands() {
    return knex('bands');
}


function validate(band) {
    return new Promise(function(resolve, reject) {
        resolve(band);

        //FIXME:1 joi validations
        //FIXME:2 Make sure band name doesn't exist!
            //If they do exist, check if deleted@, if true, ok to create band

        //resolve with band
        //reject with errors
    });
}

function create(band, request) {
    return new Promise(function(resolve, reject) {
        band = assign({}, band, {
            slug: createSlug(),
            profile_image: '/assets/band_avatar.png'
        });

        Bands().insert(band).returning('*')
            .then(function(newBand) {
                newBand = newBand[0];
                resolve(newBand);
            })
            .catch(reject);
    });
}

function updateImage(id, image_url) {
    return new Promise(function(resolve, reject) {
        Bands().where({id: id}).update({
            profile_image: image_url
        }).returning('*')
        .then(function(band) {
            resolve(band[0]);
        }).catch(reject);
    });
}

function update(slug, band) {
    return new Promise(function(resolve, reject) {

        band = updateCreatedAt(band);

        Bands().where({slug: slug}).update(band, '*')
        .then(function(updated) {
            updated = updated[0];
            resolve(updated);
        }).catch(reject);
    });
}

function softDelete(slug) {
    return new Promise(function(resolve, reject) {
        Bands().where({slug: slug}).first('*').then(function(bandToUpdate) {
            bandToUpdate = updateDeletedAt(bandToUpdate);
            return Bands().where({id: bandToUpdate.id}).update(bandToUpdate, '*');
        }).then(function(deleted) {
            resolve(deleted[0]);
        }).catch(reject);
    });
}


function findAllWithLimit(limit, offset) {
    if (!limit || typeof limit !== 'number') {limit = 10000;}
    if (!offset || typeof limit !== 'number') {offset = 0;}
    return new Promise(function(resolve, reject) {
        Bands().where({deleted_at: null}).limit(limit).offset(offset).then(resolve).catch(reject);
    });
}


function findAll() {
    return new Promise(function(resolve, reject) {
        Bands().where({deleted_at: null}).then(resolve).catch(reject);
    });
}


function findOneBySlug(slug) {
    // FIXME:10 Add Admins Array to output?
    return new Promise(function(resolve, reject) {
        Bands().where({deleted_at: null, slug: slug})
        .first('*')
        .then(resolve)
        .catch(reject);
    });
}


function findOneById(id) {
    return new Promise(function(resolve, reject) {
        Bands().where({deleted_at: null, id: id})
        .first('*')
        .then(resolve)
        .catch(reject);
    });
}



function findOneBySlugWithEvents(slug) {
    return new Promise(function(resolve, reject) {
        Bands().where({slug: slug}).first('*')
        .then(function(band) {
            return Promise.join(
                band,
                Timeslots.fetchByBandId(band.id),
                knex('genres').where({band_id: band.id})
            );
        }).then(function(data) {
            resolve({
                band: data[0],
                timeslots: data[1],
                genres: data[2],
            });
        }).catch(reject);
    });
}


function updateCreatedAt(band) {
    return assign({}, band, {
        updated_at: new Date()
    });
}

function updateDeletedAt(band) {
    return assign({}, band, {
        deleted_at: new Date()
    });
}


function createSlug() {
    return randomstring.generate(10).toLowerCase();
}



module.exports = {
    validate: validate,
    create: create,
    updateImage: updateImage,
    update: update,
    softDelete: softDelete,
    findOneBySlug: findOneBySlug,
    findOneById: findOneById,
    findOneBySlugWithEvents: findOneBySlugWithEvents
};
