'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('events', function(table) {
        table.increments();
        table.timestamp('event_date');
        table.integer('venue_id').references('id').inTable('venues');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('events');
};
