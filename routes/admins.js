'use strict';

const router = require('express').Router();
const assign = require('object-assign');
const Promise = require('bluebird');
const Band = require('../db/Band.model');
const Venue = require('../db/Venue.model');
const Admin = require('../db/Admin.model');
const Genre = require('../db/Genre.model');
const Notifs = require('../db/Notifs.model');
const Timeslots = require('../db/Timeslots.model');


module.exports = function(io) {


    io.on('connection', function(socket) {
        socket.on('notification', function(data) {
            Admin.findAdminsBySlug(data.slug_to_notify)
                .then(function(users) {
                    users.admins.forEach(function(user) {
                        socket.broadcast.to(user).emit('notification', data);
                    });
                });
        });
    });



    router.get('/', function(req, res, next) {
        /*
            return all admin data
                -> bands
                -> venues
                -> settings?
        */
        var user = req.user;


        var bands = [];
        var venues = [];


        Promise.join(
            Admin.findAllBandsByAdmin(user.id),
            Admin.findAllVenuesByAdmin(user.id)
        ).then(function(adminData) {

            bands = adminData[0];
            venues = adminData[1];
            var slots = [];

            for (let i = 0; i < bands.length; i++) {
                slots.push(Timeslots.fetchByBandIdWithData(bands[i].id, false, false));
            }

            for (let i = 0; i < venues.length; i++) {
                slots.push(Timeslots.fetchByVenueIdWithData(venues[i].id, false, false));
            }

            return Promise.all(slots);

        }).then(function(tss) {
            var allSlots = [];
            tss.forEach(function(ent) {
                ent.forEach(function(t) {
                    allSlots.push(t);
                });
            });

            var timeslots = allSlots.sort(function(a, b) {
                return new Date(a.data.start_time) - new Date(b.data.start_time);
            });

            if (timeslots.length > 9) {
                //only return up to 1st 10 items
                timeslots = timeslots.slice(0, 10);
            }

            res.status(200).json({
                bands: bands,
                venues: venues,
                timeslots: timeslots
            });
        }).catch(function(err) {
            res.throwClientError('An error occured fetching bands and venues.');
            res.logError('/routes/admins', 'GET', '/admins', JSON.stringify(req.user), err);
        });
    });


    router.get('/notifications', function(req, res) {
        var userId = req.user.id;
        Notifs.getNotifications(userId)
            .then(function(notifs) {
                res.json({
                    notifications: notifs
                });
            }).catch(function(err) {
                console.log("err", err);
            });
    });


    router.put('/notifications', function(req, res) {
        var userId = req.user.id;
        var notificationId = req.body.notification;
        Notifs.setNotificationAsRead(notificationId)
            .then(function(notif) {
                res.json({
                    notification: notif
                });
            }).catch(function(err) {
                console.log("err", err);
            });
    });


    router.post('/notifications', function(req, res) {

        var type = req.body.type;
        var text = req.body.text;

        Admin.findAdminsBySlug(req.body.slug_to_notify)
        .then(function(users) {
            return Promise.all(users.admins.map(function(user) {
                return Notifs.create(user, type, text)
            }));
        }).then(function(notifs) {
            res.json({
                notifs: notifs
            });
        }).catch(function(err) {
            //error creating notif
            console.error("error creating notif", err);
        });

    });



    /**
    * Admin Band Routes
        -> Used for admin related band events,
            -> add new admin
            -> edit band info
            -> create new band
            -> delete bands
    */

    //get all bands of specific admin/user
    router.get('/bands', function(req, res) {
        var user = req.user;
        Admin.findAllBandsByAdmin(user.id)
            .then(function(bands) {
                res.status(200).json({
                    bands: bands
                });
            })
            .catch(function(err) {
                res.throwClientError('Unable to fetch bands, please try again.');
                res.logError('/routes/admins', 'GET', '/admins/bands', JSON.stringify(req.user), err.message);
            });
    });

    //create new band
    router.post('/bands', function(req, res) {
        var user = req.user;
        var inputtedBand = req.body;
        var cityState = getCityStateFromLocation(req.body.location);

        var influences = req.body.influences || [];
        var gear_needed = req.body.gear_needed || [];
        var gear_owned = req.body.gear_owned || [];
        var genres = req.body.genres || [];

        var newBand = assign({}, inputtedBand, {
            city: cityState.city,
            state: cityState.state,
            lat: req.body.location.location.lat,
            lng: req.body.location.location.lng,
            google_place_id: req.body.location.placeId,
            influences: influences.join(', ').replace(/(\])/g, '').replace(/(\[)/g, ''),
            gear_needed: gear_needed.join(', ').replace(/(\])/g, '').replace(/(\[)/g, ''),
            gear_owned: gear_owned.join(', ').replace(/(\])/g, '').replace(/(\[)/g, '')
        });
        delete newBand.location;
        delete newBand.genres;

        //validate inputs
        Band.validate(newBand)
        .then(create)
        .then(addAdminToBand)
        .then(addGenresToBand)
        .then(function(createdBand) {
            res.status(200).json({
                created: true,
                data: {
                    band: createdBand[0],
                    admin: createdBand[1],
                    // genres: createdBand[2]
                }
            });
        })
        .catch(function(err) {
            // FIXME:0 POST bands/ -> Delete created admin/band on error
            res.throwClientError('There was an error creating your band. Please try again.');
            res.logError('/routes/admins', 'POST', '/admins/bands', JSON.stringify(req.user) + ' : '+ JSON.stringify(inputtedBand), err.message);
        });

        function create(band) {
            // FIXME:0 Add band name to slug
            //add band name slug to
            return Band.create(band, inputtedBand);
        }

        function addAdminToBand(band) {
            return Promise.join(
                band,
                Admin.addAdminToBand(band.id, user.id)
            );
            // return Admin.addAdminToBand(band.id, user.id);
        }

        function addGenresToBand(data) {
            var band = data[0];
            var admin = data[1];

            return Promise.join(
                band,
                admin,
                Genre.addGenresToBand(genres, band.id)
            );
        }
    });


    router.post('/bands/image', function(req, res) {
        var image = req.body.image_url;
        var id = req.body.id;
        Band.updateImage(id, image)
        .then(function(band) {
            res.json({
                band: band
            });
        }).catch(function(err) {
            res.throwClientError('Unable to upload band image.');
        });
    });

    router.get('/bands/:slug', function(req, res) {
        Band.findOneBySlug(req.params.slug)
        .then(function(band) {
            band = (!band) ? null : band;
            res.status(200).json({
                slug: req.params.slug,
                band: band
            });
        })
        .catch(function(err) {
            res.throwClientError('Unable to find band.');
            res.logError('/routes/admins', 'GET', '/admins/bands/'+req.params.slug, JSON.stringify(req.user) + ' :  An error occurred finding band by slug: ' + req.params.slug, err.message);
        });
    });

    router.put('/bands/:slug', function(req, res) {
        // FIXME:0 Need to validate inputted band
        var inputtedBand = req.body;
        Band.update(req.params.slug, inputtedBand)
            .then(function(updatedBand) {
                res.status(200).json({
                    updated: updatedBand
                });
            }).catch(function(err) {
                res.throwClientError('Unable to update band.');
                res.logError('/routes/admins', 'PUT', '/admins/bands/'+req.params.slug, JSON.stringify(req.user) + ' :  An error occurred updating band by slug: ' + req.params.slug, err.message);
            });
    });

    router.delete('/bands/:slug', function(req, res) {
        Band.softDelete(req.params.slug)
            .then(function(deleted) {
                res.status(200).json({
                    deleted: deleted
                });
            }).catch(function(err) {
                res.throwClientError('An error occurred deleting the band.');
                res.logError('/routes/admins', 'DELETE', '/admins/bands/'+req.params.slug, JSON.stringify(req.user) + ' :  An error occurred deleting band by slug: ' + req.params.slug, err.message);
            });
    });





    /**
    * Admin Venue Routes
        -> Used for admin related venue events,
            -> add new admin
            -> edit venue info
            -> create new venue
            -> delete venues
    */

    //get all bands of specific admin/user
    router.get('/venues', function(req, res) {
        var user = req.user;
        Admin.findAllVenuesByAdmin(user.id)
            .then(function(venues) {
                res.status(200).json({
                    venues: venues
                });
            })
            .catch(function(err) {
                res.throwClientError('There was an error finding venues by admin.')
                res.logError('/routes/admins', 'GET', '/admins/venues', JSON.stringify(req.user) + ' :  An error occurred finding venues', err.message);
            });
    });

    router.post('/venues', function(req, res) {
        var user = req.user;
        var inputtedVenue = req.body;

        var address = inputtedVenue.location.label.substring(0, inputtedVenue.location.label.indexOf(','));
        var city_state = inputtedVenue.location.label.substring(inputtedVenue.location.label.indexOf(',') + 2, inputtedVenue.location.label.lastIndexOf(','));

        var newVenue = assign({}, inputtedVenue, {
            address: address,
            city_state: city_state,
            lat: inputtedVenue.location.location.lat,
            lng: inputtedVenue.location.location.lng,
            google_place_id: inputtedVenue.location.placeId
        });
        delete newVenue.location;

        Venue.validate(newVenue)
            .then(create)
            .then(addAdminToVenue)
            .then(function(createdVenue) {
                res.status(200).json({
                    created: true,
                    data: {
                        venue: createdVenue[0],
                        admin: createdVenue[1]
                    }
                });
            })
            .catch(function(err) {
                res.throwClientError('There was an error creating your venue. Please try again.');
                res.logError('/routes/admins', 'POST', '/admins/venues', JSON.stringify(req.user) + ' : '+ JSON.stringify(inputtedVenue), err.message);
            });

        function create(venue) {
            // FIXME:0 Add venue name to slug
            return Venue.create(venue);
        }

        function addAdminToVenue(venue) {
            return Promise.join(
                venue,
                Admin.addAdminToVenue(venue.id, user.id)
            );
        }
    });

    router.post('/venues/image', function(req, res) {
        var image = req.body.image_url;
        var id = req.body.id;
        Venue.updateImage(id, image)
        .then(function(band) {
            res.json({
                venue: venue
            });
        }).catch(function(err) {
            res.throwClientError('Unable to upload venue image.');
        });
    });

    router.get('/venues/:slug', function(req, res) {
        Venue.findOneBySlug(req.params.slug)
        .then(function(venue) {
            venue = (!venue) ? null : venue;
            res.status(200).json({
                slug: req.params.slug,
                venue: venue
            });
        })
        .catch(function(err) {
            res.throwClientError('Unable to find venue.');
            res.logError('/routes/admins', 'GET', '/admins/venues/'+req.params.slug, JSON.stringify(req.user) + ' :  An error occurred finding venue by slug: ' + req.params.slug, err.message);
        });
    });

    router.put('/venues/:slug', function(req, res) {
        var inputtedVenue = req.body;
        Venue.update(req.params.slug, inputtedVenue)
            .then(function(updatedVenue) {
                res.status(200).json({
                    updated: updatedVenue
                });
            }).catch(function(err) {
                res.throwClientError('Unable to update venue.');
                res.logError('/routes/admins', 'PUT', '/admins/venues/'+req.params.slug, JSON.stringify(req.user) + ' :  An error occurred updating venue by slug: ' + req.params.slug, err.message);
            });
    });

    router.delete('/venues/:slug', function(req, res) {

        Venue.softDelete(req.params.slug)
            .then(function(deleted) {
                res.status(200).json({
                    deleted: deleted
                });
            }).catch(function(err) {
                res.throwClientError('An error occurred deleting the band.');
                res.logError('/routes/admins', 'DELETE', '/admins/bands/'+req.params.slug, JSON.stringify(req.user) + ' :  An error occurred deleting band by slug: ' + req.params.slug, err.message);
            });
    });





    return router;

};






function getCityStateFromLocation(location) {
    var city = location.label.substring(0, location.label.indexOf(','));
    var state = location.label.substring(location.label.indexOf(',') + 2, location.label.lastIndexOf(','));
    return {
        city: city,
        state: state
    }
}

function getGooglePlaceId(location) {
    return location.placeId;
}

function getLatLong(location) {
    return location.location;
}
