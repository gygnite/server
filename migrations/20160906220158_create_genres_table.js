'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('genres', function(table) {
        table.increments();
        table.string('genre');
        table.integer('band_id').references('id').inTable('bands');
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('genres');
};
