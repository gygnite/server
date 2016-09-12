'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('band_members_in_band', function(table) {
        table.increments();
        table.integer('band_member_id').references('id').inTable('band_members');
        table.integer('band_id').references('id').inTable('bands');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('band_members_in_band');
};
