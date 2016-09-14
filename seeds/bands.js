'use strict';

var BandModel = require('../db/Band.model');
var bandSeeds = require('../db/seed_data/bands');
var genres = require('../db/seed_data/genres');


exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries

    var newBands = [];
    bandSeeds.forEach(function(band) {
        newBands.push(BandModel.create(band));
    });
    return Promise.all(newBands)
    .then(function(allbands) {
        var allgenres = [];
        genres.forEach(function(g) {
            allgenres.push(knex('genres').insert(g));
        });

        return Promise.all(allgenres);

    });
};
