'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('notifications', function(table) {
        table.increments();
        table.string('type');
        table.string('text');
        table.integer('user_to_notify').references('id').inTable('users');
        table.boolean('seen').defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('notifications');
};
