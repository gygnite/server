const express = require('express'),
    app = express(),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    server = require('http').Server(app),
    io = require('socket.io')(http);
const port = process.env.PORT || 4000;




io.on('connection', function(socket) {
    console.log("socket connected...");
});


server.listen(port, function() {
    console.log("listening on", port);
});
