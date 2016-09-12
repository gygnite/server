'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('genres', function(table) {
        table.increments();
        table.string('genre');
        table.integer('band_id').references('id').inTable('bands');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('genres');
};
