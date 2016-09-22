'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('timeslots', function(table) {
        table.increments();
        table.timestamp('start_time');
        table.timestamp('end_time');
        table.integer('origin_id');
        table.integer('venue_id').references('id').inTable('venues').nullable();
        table.integer('band_id').references('id').inTable('bands').nullable();
        table.string('event_link');
        table.string('facebook_link');
        table.boolean('venue_booking').defaultTo(false);
        table.boolean('headliner').defaultTo(false);
        table.boolean('pending').defaultTo(true);
        table.boolean('accepted');
        table.boolean('rejected');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('timeslots');
};
