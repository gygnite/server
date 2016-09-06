// Build POST String
var querystring = require('querystring');
var https = require('https');

const url = 'http://localhost:3000';

const config = {
    'username' : process.env.EE_USERNAME,
    'api_key': process.env.EE_APIKEY,
    from: process.env.EE_USERNAME,
    from_name: 'Gygnite'
};
const templates = [
    'account_activation'
];

function sendEmail(template, data) {

    if (!template || templates.indexOf(template) < 0) {
        template = 'generic';
    }
    if (!data.mergeable || data.mergeable.constructor !== Object) {
        mergeable = {};
    }

    for (var field in data.mergeable) {
        if (data.mergeable.hasOwnProperty(field)) {
            data.mergeable['merge_'+field] = data.mergeable[field];
            delete data.mergeable[field];
        }
    }

    var post_data = {
        to: data.to || process.env.EE_USERNAME,
        subject: data.subject || 'Message from Gygnite',
        template: template,
        merge_websiteurl: url
    };

    var dataToSend = querystring.stringify(Object.assign(config, post_data, data.mergeable));

    var result = postEmailToElastic(dataToSend);

}


function postEmailToElastic(data) {
    const post_options = {
        host: 'api.elasticemail.com',
        path: '/mailer/send',
        port: '443',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    };
    var result = '';
    // Create the request object.
    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            result = chunk;
        });
        res.on('error', function (e) {
            result = 'Error: ' + e.message;
        });
    });

    // Post to Elastic Email
    post_req.write(data);
    post_req.end();
    return result;
}



module.exports = {
    send: sendEmail
};
