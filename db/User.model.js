'use strict';

const knex = require('./knex');
const Promise = require('bluebird');
const assign = require('object-assign');


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
        user = assign({}, user, {
            profile_image: '/assets/avatar.png'
        });
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

function update(id, user) {
    return new Promise(function(resolve, reject) {
        User().where({id: id})
        .update(user)
        .returning('*')
        .then(function(user) {
            user = user[0];
            resolve(user);
        }).catch(reject);
    });
}


function updateImage(id, profile_image) {
    return new Promise(function(resolve, reject) {
        User().where({id: id}).update({
            profile_image: profile_image
        }).returning('profile_image')
        .then(function(image) {
            image = image[0];
            resolve(image);
        }).catch(reject);
    });
}



module.exports = {
    findOne: findOne,
    create: create,
    exists: exists,
    update: update,
    updateImage: updateImage
};
