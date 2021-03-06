'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('band_members', function(table) {
        table.increments();
        table.string('first_name');
        table.string('last_name');
        table.string('instruments');
        table.integer('birthdate_day');
        table.integer('birthdate_month');
        table.integer('birthdate_year');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('band_members');
};
