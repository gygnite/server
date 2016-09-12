'use strict';



function ClientError(message) {
    this.type = 'ClientError';
    this.message = message || 'An error occurred please try again';
}

ClientError.prototype = Object.create(Error.prototype);
ClientError.prototype.constructor = ClientError;



function ServerError(message) {
    this.type = 'ServerError';
    this.message = message || 'Database Error Has Occured';
    this.stack = (new Error()).stack;
}

ServerError.prototype = Object.create(Error.prototype);
ServerError.prototype.constructor = ServerError;

function LogError(filePath, method, route, message, trueError) {
    filePath = filePath || ' ';
    method = method || ' ';
    route = route || ' ';
    message = message || 'An Error Occured...';
    trueError = trueError || 'No trueError included.'
    var fullMessage = filePath + ' : ' + method + ' : ' + route + ' : ' + message;
    this.type = 'LogError';
    this.message = fullMessage;
    this.stack = (new Error()).stack;
    this.trueError = trueError;
}

module.exports = {
    ClientError,
    ServerError,
    LogError
};
