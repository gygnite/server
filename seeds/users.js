var usersSeed = require('../db/seed_data/users');

exports.seed = function(knex, Promise) {
    //// Deletes ALL existing entries
    return knex('users').del()
        .then(function() {
            var users = usersSeed.map(function(u) {
                return knex('users').insert(u);
            });
            return Promise.all(users);
        });
};
