'use strict';
var mongoose = require('mongoose');
var env = require('./env')[process.env.NODE_ENV || 'development'];
mongoose.connect(env);
mongoose.Promise = require('bluebird');
// assert.equal(query.exec().constructor, require('bluebird'));
module.exports = mongoose;
