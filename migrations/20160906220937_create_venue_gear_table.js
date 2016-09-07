'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('venue_gear', function(table) {
        table.increments();
        table.string('item');
        table.integer('quanitity');
        table.integer('venue_id').references('id').inTable('venues');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('venue_gear');
};
