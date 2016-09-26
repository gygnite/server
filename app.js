'use strict';
require('dotenv').config();
const express = require('express'),
    app         = express(),
    cors        = require('cors'),
    logger      = require('morgan'),
    bodyParser  = require('body-parser'),
    expressJWT  = require('express-jwt'),
    ClientError = require('./errors/Error').ClientError,
    ServerError = require('./errors/Error').ServerError,
    LogError    = require('./errors/Error').LogError,
    server      = require('http').Server(app),
    io          = require('socket.io')(server),
    socketioJwt = require("socketio-jwt");
const port = process.env.PORT || 4000;


app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());


app.use(function(req, res, next) {
    res.throwClientError = function(message) {
        var error = new ClientError(message);
        next(error);
    };
    res.throwServerError = function(message) {
        var error = new ServerError(message);
        next(error);
    };
    res.logError = function(filePath, method, route, message, trueError) {
        var error = new LogError(filePath, method, route, message, trueError);
        console.error(error);
        var fs = require('fs');
        var logStream = fs.createWriteStream('error-log.txt', {'flags': 'a'});
        logStream.write((new Date) + '-----\n\t');
        logStream.write(error.type + '\n');
        logStream.write(error.message + '\n');
        logStream.write(error.stack + '\n');
        logStream.write(error.trueError + '\n');
        logStream.end();
    };
    next();
});



var routes = {
    auth: require('./routes/auth'),
    api: require('./routes/api'),
    search: require('./routes/search'),
    bands: require('./routes/bands'),
    venues: require('./routes/venues')
};


var socketConnections = [];

io.use(socketioJwt.authorize({
  secret: process.env.JWT_SECRET,
  handshake: true
}));

io.on('connection', function(socket) {
    // console.log("***");
    // socket.join(socket.decoded_token.id);
    // console.log("socket", socket);
    // console.log("***");

    socket.on('connectToRoom', function(data) {
        socket.join(data.user);
    });
});

// io.on('disconnect', function(socket) {
//     socketConnections.splice(socketConnection.indexOf(socket), 1);
// });



app.use('/auth', routes.auth);
app.use('/search', routes.search);
app.use('/bands', routes.bands);
app.use('/venues', routes.venues);
app.use('/api',
    expressJWT({
        secret: process.env.JWT_SECRET
    }), routes.api(io));



/** Unauthorized JWT Error */
app.use(function(err, req, res, next) {
    console.log("err!", err)
    if (err.status === 401) {
        res.status(401).json({
            message: 'Invalid Token or Unauthorized',
            status: 401,
            error: err.inner.message || 'Invalid Token or Unauthorized'
        });
    } else {
        next(err);
    }
});

app.use(function(err, req, res, next) {
    if (err.type && err.type === 'ClientError') {
        res.json({
            error: true,
            message: err.message
        });
    } else {
        //err.type === 'ServerError'
        res.json({
            error: true,
            message: 'An error has occured. Please try again.'
        });
        console.log("err", err);
    }
});



server.listen(port, function() {
    console.log("listening on", port);
});




module.exports = app;
