'use strict';
var randomstring = require('randomstring');

exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(table) {
        table.increments();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('first_name');
        table.string('last_name');
        table.string('activation_code').defaultTo(randomstring.generate());
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at').defaultTo();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};
