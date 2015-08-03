#!/usr/bin/env node
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var serve = serveStatic('dist', {'index': ['index.html']});

http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
}).listen(2015);

console.log('listening server on port 2015');
