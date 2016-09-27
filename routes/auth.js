'use strict';
const router = require('express').Router();
const bcrypt = require('bcrypt');
const errors = require('../errors/builder');
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const emailer = require('../emailer');

const User = require('../db/User.model');

const validPassword = Joi.string().regex(/^(?=.{8,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/g).required();
const loginSchema = Joi.object().keys({
    email: Joi.string().email().required().label('Email'),
    password: validPassword
});
const signupSchema = Joi.object().keys({
    email: Joi.string().email().required().regex(/^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/igm).label('Email'),
    password: validPassword,
    first_name: Joi.string().required(),
    last_name: Joi.string().required()
});




/**
* GET /auth
    check if user is authenticated
        if T -> send user data
        if F -> send 401 + null
*/
router.get('/',
    expressJWT({
        secret: process.env.JWT_SECRET
    }), function(req, res) {
        if (req.user) {
            res.status(200).json({
                user: req.user
            });
        } else {
            res.status(401).json({
                user: null
            });
        }
    });



router.post('/login', function(req, res) {
    var inputtedUser = req.body;

    Joi.validate(inputtedUser, loginSchema, handleValidation);

    function handleValidation(err, validated) {
        if (err) {
            return errors.authorization.invalidCredentials(res);
        } else {
            loginUser();
        }
    }

    function loginUser() {
        User.findOne(inputtedUser.email)
        .then(function(user) {
            bcrypt.compare(inputtedUser.password, user.password, function(err, result) {
                if (err || !result) {
                    return errors.authorization.invalidCredentials(res);
                } else {
                    delete user.password;
                    var token = jwt.sign(user, process.env.JWT_SECRET);
                    return res.json({
                        user: user,
                        token: token
                    });
                }
            });
        }).catch(function() {
            return errors.authorization.invalidCredentials(res);
        });
    }

});


router.post('/signup', function(req, res) {
    
    var inputtedUser = req.body;
    Joi.validate(req.body, signupSchema, validateUser);

    function validateUser(err, value) {
        if (err) {
            return errors.authorization.invalidCredentials(res);
        } else {
            User.exists(inputtedUser.email)
            .then(function(userExists) {
                if (!userExists) {
                    signupUser();
                } else {
                    return errors.authorization.invalidCredentials(res, {
                        message: 'Account already exists, please log in.'
                    });
                }
            }).catch(function(err) {
                return errors.database.generalDatabaseError(res);
            });
        }
    }

    function signupUser() {
        bcrypt.hash(inputtedUser.password, 10, function(err, hash) {
            if (err) {
                return errors.database.generalDatabaseError(res);
            } else {
                User.create({
                    first_name: inputtedUser.first_name,
                    last_name: inputtedUser.last_name,
                    email: inputtedUser.email,
                    password: hash
                }).then(function(createdUser) {

                    sendRegistrationEmail(createdUser);

                    return res.json({
                        success: true,
                        message: 'Account created'
                    });
                });
            }
        });
    }

    function sendRegistrationEmail(user) {
        // emailer.send('account_activation', {
        //     to: user.email,
        //     subject: 'Welcome to Gygnite!',
        //     mergeable: {
        //         first_name: user.first_name,
        //         activation_code: user.activation_code
        //     }
        // });
    }
});


router.post('/register/:code', function(req, res) {
    if (!req.params.code) {
        //invalid code
        res.json({
            invalid: 'activation code',
            fixme: true
        });
    }
    User.findOne({activation_code: req.params.code}).then(function(user) {
        console.log("user found!", user);
        res.json({
            user: user
        });
    });
});



module.exports = router;
