'use strict';

const router = require('express').Router();
const User = require('../db/User.model');


router.put('/', function(req, res) {
    var userId = req.user.id;
    User.update(userId, req.body)
    .then(function(user) {
        res.status(200).json({
            user: user
        });
    }).catch(function(err) {
        res.throwClientError('An error occurred while updating user.');
    });
});

router.put('/image', function(req, res) {
    var img = req.body.profile_image;
    var id = req.user.id;
    User.updateImage(id, img).then(function(image) {
        res.json({
            profile_image: image
        });
    }).catch(function(err) {
        res.throwClientError('An error occurred while adding image.');
    });
});


router.delete('/', function(req, res) {
    //delete user, but not data
    //not waterfall
});


module.exports = router;
