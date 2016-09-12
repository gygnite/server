'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('events', function(table) {
        table.increments();
        table.timestamp('event_date');
        table.integer('venue_id').references('id').inTable('venues');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('events');
};
