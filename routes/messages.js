'use strict';

const router = require('express').Router();
const knex = require('../db/knex');
const Admin = require('../db/Admin.model');
const Message = require('../db/Message.model');
const Promise = require('bluebird');


router.get('/', function(req, res) {
    Promise.join(
        Admin.findAllVenuesByAdmin(req.user.id),
        Admin.findAllBandsByAdmin(req.user.id)
    ).then(function(data) {
        var venues = data[0].map(function(v, i) {
            return Promise.join(
                {id: v.id, slug: v.slug, type: 'venue', name: v.name},
                Message.findVenueMessages(v.id)
            );
        });
        var bands = data[1].map(function(b, i) {
            return Promise.join(
                {id: b.id, slug: b.slug, type: 'band', name: b.name},
                Message.findBandMessages(b.id)
            );
        });

        return Promise.join(
            Promise.all(venues),
            Promise.all(bands)
        );

    }).then(function(data) {
        var venuesAndBands = data[0].concat(data[1]);
        var groups = venuesAndBands.map(function(v, i) {
            var identity = v[0];
            var allMsgs = v[1];
            var hasUnread = false;
            var msgGroups = {};
            allMsgs.forEach(function(msg) {
                //check type of id,
                    //if type is band, group by venue_id
                    //if type is venue, group messages by band_id
                var type = (identity.type === 'band') ? 'venue' : 'band';

                if (!msgGroups.hasOwnProperty(msg[type+'_slug'])) {
                    //if the message group does not have a group for the id chosen
                    msgGroups[msg[type+'_slug']] = {
                        identity: {
                            type: type,
                            slug: msg[type+'_slug'],
                            name: msg[type+'_name'],
                            image: msg[type+'_image'],
                            id: msg[type+'_id']
                        },
                        messages: [],
                        hasUnread: false
                    };
                }
                if (!msg.date_read) {
                    msgGroups[msg[type+'_slug']].hasUnread = true;
                    hasUnread = true;
                }
                msgGroups[msg[type+'_slug']].messages.push(msg);
            });
            return {
                identity: identity,
                messageGroups: msgGroups,
                hasUnread: hasUnread
            }
        });

        res.json({
            success: true,
            data: groups
        });
    }).catch(function(err) {
        // FIXME: Unable to fetch messages
        console.error('unable to fetch messages: ', err);
        res.json({
            success: false,
            data: {},
            message: 'Unable to fetch messages'
        });
    });

});





router.post('/', function(req, res) {
    var type = req.body.type;

    if (type === 'bands') {
        var band_id = req.body.sender_id;
        var venue_id = req.body.receiver_id;
    } else {
        var venue_id = req.body.sender_id;
        var band_id = req.body.receiver_id;
    }

    var message = {
        user_id: req.user.id,
        content: req.body.content,
        band_id: band_id,
        venue_id: venue_id
    };


    Message.createNew(message, type)
        .then(function(msg) {
            return Message.findOneWithData(msg.id, type);
        }).then(function(msg) {
            res.json({
                message: msg
            });
        }).catch(function(err) {
            console.error(err);
        });
});






module.exports = router;
