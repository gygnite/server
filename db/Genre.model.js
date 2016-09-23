'use strict';

const Promise = require('bluebird');
const Joi = require('joi');
const knex = require('./knex');

function Genres() {
    return knex('genres');
}

function addGenresToBand(genres, bandId) {
    return new Promise(function(resolve, reject) {
        var all = genres.map(function(g, i) {
            return Genres().insert({
                genre: genres,
                band_id: bandId
            }).returning('*');
        });
        Promise.all(all).then(function(inserted) {
            resolve(inserted);
        }).catch(reject);
    });
}



module.exports = {
    addGenresToBand: addGenresToBand
};
