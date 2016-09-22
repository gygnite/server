'use strict';

const router = require('express').Router();
const User = require('../db/User.model');


router.put('/', function(req, res) {
    var userId = req.user.id;
    User.update(userId, req.body)
    .then(function(user) {
        console.log("user!", user);
        res.status(200).json({
            user: user
        });
    }).catch(function(err) {
        console.log("ERROR!", err);
        // FIXME: Error handling needed
    });
});

router.put('/image', function(req, res) {
    // console.log("adding image!", )
    var img = req.body.profile_image;
    var id = req.user.id;
    User.updateImage(id, img).then(function(image) {
        console.log("image, ", image);
        res.json({
            profile_image: image
        });
    }).catch(function(err) {
        console.log("ERROR!", err);
        res.json({
            profile_image: image
        });
        // FIXME: Error handling needed
    });
});


router.delete('/', function(req, res) {
    //delete user, but not data
    //not waterfall
});


module.exports = router;
