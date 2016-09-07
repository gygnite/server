'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('band_admins', function(table) {
        table.increments();
        table.integer('user_id').references('id').inTable('users');
        table.integer('band_id').references('id').inTable('bands');
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('band_admins');
};
