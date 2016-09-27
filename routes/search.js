const router = require('express').Router();
const knex = require('../db/knex');
const Promise = require('bluebird');
const url = require('url');
const redis = require('redis');

// // if (process.env.CLUSTER_URL) {
// //     const redisClient = redis.createClient(process.env.CLUSTER_URL);
// // } else {
//     const redisClient = redis.createClient();
// // }

// const redisClient = redis.createClient(process.env.REDIS_URL);


// console.log("redisClient", redisClient)

/**
* Searches and sorts bands based on input queries
* @query param: q={:name, :bio, :city, :state, :influences}
* @query param: genre={:genre}
    -> takes an array and will filter by best match
    -> will also return partial matched results
        -> (genre = funk, blues) will return results for funk, blues, and funk & blues sorted by amount of matches
*/
router.get('/bands', function(req, res) {

    var fullQuery = url.parse(req.url).query;

    // redisClient.get(fullQuery, function(err, reply) {
    //     console.log("getting bands!", err, reply);
    //     if (!err && reply) {
    //         return res.json({
    //             bands: JSON.parse(reply)
    //         });
    //     } else {
            var query = '%%';
            var genres = '%%';

            if (req.query.q) {
                // query = req.query.q.toLowerCase().replace(/(\W)/g, ' ').split(' ').join('|');
                query = '%('+req.query.q+')%';
                // ?q={:name, :bio, :city, :state, :influences}
            }

            if (req.query.genre) {
                var genres = req.query.genre;
                if (genres.constructor !== Array) {
                    genres = [genres];
                }
                genres = genres.map(function(g) {
                    return g.toLowerCase();
                });
                genres = '%('+genres.join('|')+')%';
            }

            if (!req.query.q && !req.query.genre) {
                console.log("!req.query.q && !req.query.genre", req.query.q, req.query.genre)
                return res.json({
                    bands: []
                });
            }

            console.log("query", query);
            console.log("genres", genres);


            knex('bands')
                .select('bands.id')
                // .innerJoin('genres','genres.band_id', '=', 'bands.id')
                // .whereRaw('LOWER(genres.genre) SIMILAR TO ?', genres)
                .then(function(ids) {
                    console.log("ids", ids);
                    ids = ids.map(function(id) {
                        return id.id;
                    });
                    return knex('bands')
                        .where(function() {
                            this.where(knex.raw('LOWER(bands.name) SIMILAR TO ?', query))
                                .orWhere(knex.raw('LOWER(bands.bio) SIMILAR TO ?', query))
                                .orWhere(knex.raw('LOWER(bands.city) SIMILAR TO ?', query))
                                .orWhere(knex.raw('LOWER(bands.state) SIMILAR TO ?', query))
                                .orWhere(knex.raw('LOWER(bands.influences) SIMILAR TO ?', query))
                        }).whereIn('bands.id', ids)
                        .innerJoin('genres','genres.band_id', '=', 'bands.id')
                        .select([
                            'genres.band_id as id',
                            'bands.name as name',
                            'bands.bio as bio',
                            'bands.city as city',
                            'bands.state as state',
                            'bands.lat as lat',
                            'bands.lng as lng',
                            'bands.slug as slug',
                            knex.raw('ARRAY_AGG(genres.genre ORDER BY genre ASC) as genres')
                        ])
                        .groupBy(
                            'bands.id',
                            'bands.name',
                            'genres.band_id',
                            'bands.bio',
                            'bands.city', 'bands.state',
                            'bands.lat', 'bands.lng')
                })
            .then(function(bands) {

                // console.log("bands found...", bands);

                if (req.query.genre) {
                    bands = sortBandsByGenrePrevalence(req.query.genre, bands)
                }

                // FIXME: Change setex redis back to 1800
                // redisClient.setex(fullQuery, 1800, JSON.stringify(bands));

                res.json({
                    bands: bands
                });
            }).catch(function(err) {
                console.log("err!", err);
            });
        // }
    // });

    function sortBandsByGenrePrevalence(genres, bands) {
        return bands.sort(function(a, b) {
            var aMatches = getNumMatches(a, genres);
            var bMatches = getNumMatches(b, genres);
            if (aMatches > bMatches) {
                return -1;
            } else if (aMatches < bMatches) {
                return 1;
            } else return 0;
        });
    }

    function getNumMatches(band, genres) {
        var count = 0;
        var bandGenres = band.genres.join('|').toLowerCase().split('|');
        for (var i = 0; i < genres.length; i++) {
            var currGenre = genres[i].toLowerCase();
            if (bandGenres.indexOf(currGenre) > -1) {
                count++;
            }
        }
        return count;
    }
});


// router.get('/search/genres/unique', function(req, res) {
//     // knex('genres', where)
// });


router.get('/venues', function(req, res) {
    var fullQuery = req.query.nw_lat+req.query.nw_lng+req.query.se_lat+req.query.se_lng;
    var coordinates = {
        nw: {
            lat: req.query.nw_lat,
            lng: req.query.nw_lng
        },
        se: {
            lat: req.query.se_lat,
            lng: req.query.se_lng
        }
    };

    // redisClient.get(fullQuery, function(err, reply) {
    //     if (!err && reply) {
    //         return res.json({
    //             venues: JSON.parse(reply)
    //         });
    //     } else {
            knex('venues')
                .whereBetween('lat', [coordinates.se.lat, coordinates.nw.lat])
                .whereBetween('lng', [coordinates.se.lng, coordinates.nw.lng])
            .then(function(venues) {

                // redisClient.setex(fullQuery, 1800, JSON.stringify(venues));

                res.json({
                    venues: venues
                });
            });
        // }
    // });
});



module.exports = router;
