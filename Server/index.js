var express = require('express');

var configuration = require('./config');
var search = require('./search');

var server = express();

server.get('/v1/hello', function (req, res) {
    res.send('hello');
});

server.get('/v1/test/:message', function (req, res) {
    res.send(req.params.message);
});

server.get('/v1/emotion/:keyword/:page', function (req, res) {
    search.getImages(req.params.keyword, req.params.page, function (data) {
        res.send(data);
    }, function (error_code, error) {
        res.status(error_code).send(error.message);
    })
});

server.listen(configuration.server.port);

console.log('Server started on port ' + configuration.server.port);