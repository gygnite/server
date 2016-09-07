'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('venue_admins', function(table) {
        table.increments();
        table.integer('user_id').references('id').inTable('users');
        table.integer('venue_id').references('id').inTable('venues');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('venues_admins');
};
