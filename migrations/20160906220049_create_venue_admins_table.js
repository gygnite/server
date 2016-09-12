'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('venue_admins', function(table) {
        table.increments();
        table.integer('user_id').references('id').inTable('users');
        table.integer('venue_id').references('id').inTable('venues');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('venue_admins');
};
