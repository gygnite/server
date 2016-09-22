'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('venue_messages', function(table) {
        table.increments();
        table.integer('user_id');
        table.integer('venue_id'); //sender
        table.integer('band_id');  //receiver
        table.integer('timeslot_id');
        table.text('content');
        table.timestamp('date_created').defaultTo(knex.fn.now());
        table.timestamp('date_read');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('band_messages');
};
