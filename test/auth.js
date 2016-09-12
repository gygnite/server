'use strict';

var router = require('express');
var app = require('../app');

var request = require('supertest')(app);

var knexconfig = require('../knexfile')['test'];
var knex = require('knex')(knexconfig);


var User = require('../db/User.model');




describe('Authorization', function() {

    describe('Account Creation', function() {

        beforeEach(function() {
            return knex('users').del()
        });

        it('should create a new user', function(done) {

            var testUser = {
                "email":"gygnite-test-user@mailinator.com",
                "password": "StrongPassword123",
                "first_name": "Ronald",
                "last_name": "McDonald"
            };

            request.post('/auth/signup')
            .send(testUser)
            .expect(200, {
                success: true,
                message: 'Account created'
            }).end(done);

        });
        it('should create fail when no body is passed in', function(done) {

            var testUser = {};

            request.post('/auth/signup')
            .send(testUser)
            .expect(200, {
                success: true,
                message: 'Account created'
            }).end(done);

        });
    });
});
