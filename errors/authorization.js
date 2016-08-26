'use strict';



function invalidCredentials(res, additional) {
    var responseMessage = {
        message: 'Invalid email or password'
    };
    if (additional) {
        responseMessage = Object.assign({}, responseMessage, additional);
    }
    return res.status(401).json(responseMessage);
}



module.exports = {
    invalidCredentials: invalidCredentials
};
