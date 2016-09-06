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
        if (req.user && req.user._doc) {
            res.status(200).json({
                user: req.user._doc
            });
        } else {
            res.status(401).json({
                user: null
            });
        }
    });




router.post('/login', function(req, res) {
    Joi.validate(req.body, loginSchema, function(err, validated) {
        if (err) {
            return errors.authorization.invalidCredentials(res);
        } else {
            User.findOne({email: validated.email}, '+password', function(err, user) {
                if (user) {
                    //user exists, check login compare
                    bcrypt.compare(validated.password, user.password, function(err, result) {
                        if (err || !result) {
                            return errors.authorization.invalidCredentials(res);
                        } else {
                            var currUser = User.findOne({email: validated.email}, function(err, existing) {

                                var token = jwt.sign(existing, process.env.JWT_SECRET);
                                return res.json({
                                    user: existing,
                                    token: token
                                });
                            });
                        }
                    });
                } else {
                    //user doesn't exist, throw invalid credentials
                    return errors.authorization.invalidCredentials(res);
                }
            });
        }
    });


});




router.post('/signup', function(req, res) {
    Joi.validate(req.body, signupSchema, function(err, value) {
        if (err) {
            //invalid login credentials
            return errors.authorization.invalidCredentials(res);
        } else {
            //find user, if not exists, create, otherwise login?
            User.findOne({email: value.email}, function(err, user) {
                if (!user) {
                    //user not found
                    bcrypt.hash(value.password, 10, function(err, hash) {
                        if (!err) {
                            var newuser = new User({
                                email: value.email,
                                password: hash,
                                first_name: value.first_name || '',
                                last_name: value.last_name || '',
                            });
                            newuser.save();

                            // console.log("newuser: ", newuser.activation_code);

                            //send registration email
                            emailer.send('account_activation', {
                                to: value.email,
                                subject: 'Welcome to Gygnite!',
                                mergeable: {
                                    first_name: value.first_name,
                                    activation_code: newuser.activation_code
                                }
                            });

                            return res.json({
                                success: true,
                                message: 'Account created'
                            });
                        } else {
                            return errors.database.generalDatabaseError(res);
                        }
                    });
                } else {
                    return errors.authorization.invalidCredentials(res, {
                        message: 'Account already exists, please log in.'
                    });
                }
            });
        }
    });
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
