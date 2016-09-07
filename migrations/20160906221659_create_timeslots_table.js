'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('timeslots', function(table) {
        table.increments();
        table.time('start_time');
        table.time('end_time');
        table.integer('venue_id').references('id').inTable('venues');
        table.integer('band_id').references('id').inTable('bands');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('timeslots');
};
