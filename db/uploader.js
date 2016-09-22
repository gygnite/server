// 'use strict';
// var fs = require('fs'),
//     formidable = require('formidable'),
//     path = require('path'),
//     Promise = require('bluebird'),
//     slugify = require('slug'),
//     randomString = require('random-string');
//
// var cloudinary = require('cloudinary');
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_KEY,
//     api_secret: process.env.CLOUDINARY_SECRET
// });
//
//
// const UPLOAD_DIR =  path.resolve(__dirname, "./public/uploads");
//
//
//
// var uploader = {
//     upload: function(request) {
//         return new Promise(function(resolve, reject) {
//             console.log("shold upload", request.files);
//
//             fs.lstat(UPLOAD_DIR, function(err, stats) {
//                 if (!err) {
//                     if (stats.isDirectory()) {
//                         doUpload(request);
//                     } else {
//                         createDir(doUpload);
//                     }
//                 } else {
//                     createDir(doUpload);
//                 }
//             });
//
//             function createDir(callback) {
//                 fs.mkdir(UPLOAD_DIR, function() {
//                     return callback(request);
//                 });
//             }
//
//             function doUpload(request) {
//                 var form = new formidable.IncomingForm();
//                     form.uploadDir = UPLOAD_DIR;
//                     form.keepExtensions = true;
//                     form.multiples = true;
//
//
//                 form.on('end', function(file, index) {
//                     console.log("file!", file);
//                     console.log("index!", index);
//                     resolve();
//                 });
//             }
//         });
//     }
// }
//
//
//
// module.exports = uploader;
