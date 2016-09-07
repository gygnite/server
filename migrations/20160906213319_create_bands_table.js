'use strict';
var randomstring = require('randomstring');

exports.up = function(knex, Promise) {
    return knex.schema.createTable('bands', function(table) {
        table.increments();
        table.string('name').notNullable();
        table.string('slug').notNullable().unique().defaultTo(randomstring.generate());
        table.text('bio');
        table.string('year_established');
        table.string('location');
        table.text('gear_owned');
        table.text('gear_needed');
        table.integer('avg_set_length_minutes');
        table.text('influences');
        table.string('website_url', 2082);
        table.string('soundcloud_url', 2082);
        table.string('facebook_url', 2082);
        table.string('bandcamp_url', 2082);
        table.string('myspace_url', 2082);
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('bands');
};
