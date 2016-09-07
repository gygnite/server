'use strict';

const knex = require('./knex');
const Promise = require('bluebird');


function User() {
    return knex('users');
}


function UserModel() {};


function findOne(email) {
    return new Promise(function(resolve, reject) {
        User().where({email: email}).first('*').then(function(user) {
            (!user) ? reject() : resolve(user);
        });
    });
}

function create(user) {
    return new Promise(function(resolve, reject) {
        User().insert(user)
            .returning('*')
            .then(function(createdUser) {
                createdUser = createdUser[0];
                resolve(createdUser);
            }).catch(reject);
    });
}

function exists(email) {
    return new Promise(function(resolve, reject) {
        User().where({email: email}).first('*').then(function(user) {
            (!user) ? resolve(false) : resolve(true);
        }).catch(reject);
    });
}



module.exports = {
    findOne: findOne,
    create: create,
    exists: exists
};
