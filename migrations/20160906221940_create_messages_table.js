'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('messages', function(table) {
        table.increments();
        table.integer('sender_id');
        table.integer('receiver_id');
        table.text('content');
        table.timestamp('date_created').defaultTo(knex.fn.now());
        table.timestamp('date_read');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('messages');
};


// * sender_id
// * receiver_id
// * content
// * date_created
// * date_read
// * date_deleted (need? -> show only to receiver, sender will always see this)
