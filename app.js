'use strict';
require('dotenv').config();
const express = require('express'),
    app = express(),
    cors = require('cors'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    expressJWT = require('express-jwt'),
    server = require('http').Server(app),
    io = require('socket.io')(server);
const port = process.env.PORT || 4000;


app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());


var routes = {
    auth: require('./routes/auth')
};


app.use('/auth', routes.auth);


io.on('connection', function(socket) {
    console.log("socket connected...");
});


/** Unauthorized JWT Error */
app.use(function(err, req, res, next) {
    if (err.status === 401) {
        res.status(401).send({
            message: 'Invalid Token or Unauthorized',
            status: 401,
            error: err.inner.message || 'Invalid Token or Unauthorized'
        });
    } else {
        next();
    }
});



server.listen(port, function() {
    console.log("listening on", port);
});
