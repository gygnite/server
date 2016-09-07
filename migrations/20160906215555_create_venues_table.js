'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('venues', function(table) {
        table.increments();
        table.string('name');
        table.string('city');
        table.string('state');
        table.string('lat').notNullable();
        table.string('lng').notNullable();
        table.string('capacity');
        table.text('bio');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('venues');
};


// * Name
// * Location (map address, stored as lat long?)
// * Year opened
// * Room size (fans you can fit)
// * Bio
// * Artist Should Bring
