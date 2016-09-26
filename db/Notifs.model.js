'use strict';

const Promise = require('bluebird');
const knex = require('./knex');

function Notifications() {
    return knex('notifications');
}




function getNotifications(userId) {
    return new Promise(function(resolve, reject) {
        Notifications().where({user_to_notify: userId, seen: false})
            .limit(10)
            .orderBy('created_at', 'desc')
            .then(resolve)
            .catch(reject);
    });
}

function create(admin_id, type, text) {
    return new Promise(function(resolve, reject) {
        Notifications().insert({
            user_to_notify: admin_id,
            type: type,
            text: text
        }).returning('*')
        .then(function(notif) {
            resolve(notif[0]);
        }).catch(reject);
    });
}

function setAllAsRead(user_id) {
    return new Promise(function(resolve, reject) {
        Notifications().where({user_to_notify: user_id})
        .update({seen: true})
        .returning('*')
        .then(function(notifs) {
            resolve(notifs);
        }).catch(reject);
    });
}

function setNotificationAsRead(notification_id){
    return new Promise(function(resolve, reject) {
        Notifications().where({id: notification_id})
        .update({seen: true})
        .returning('*')
        .then(function(notifs) {
            resolve(notifs[0]);
        }).catch(reject);
    });
}



module.exports = {
    getNotifications: getNotifications,
    create: create,
    setAllAsRead: setAllAsRead,
    setNotificationAsRead: setNotificationAsRead
};
