/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var express = require('express');
var fs = require('fs');
var http = require('http2');
var path = require('path');
var parseUrl = require('url').parse;
var send = require('send');
var resolve = require('resolve');

/**
 * Make a polyserve express app.
 * @param  {string} componentDir The directory to serve components from.
 * @param  {string} packageName  A name for this polyserve package.
 * @param  {Object} headers      An object keyed by header name containing
 *                               header values.
 * @return {Object}              An express app which can be served with
 *                               `app.get`
 */
function makeApp(componentDir, packageName, headers) {
  componentDir = componentDir || 'bower_components';

  if (packageName == null) {
    var bowerFile = fs.readFileSync('bower.json');
    var bowerJson = JSON.parse(bowerFile);
    packageName = bowerJson.name;
  }

  console.log('Serving components from ' + componentDir);

  var app = express();
  app.get('*', function (req, res) {
    // Serve local files from . and other components from bower_components
    var url = parseUrl(req.url, true);
    var splitPath = url.pathname.split(path.sep).slice(1);
    splitPath = splitPath[0] == packageName
       ? splitPath.slice(1)
       : [componentDir].concat(splitPath);
    var filePath = splitPath.join(path.sep);
    if (headers) {
      for (header in headers) {
        res.append(header, headers[header]);
      }
    }
    send(req, filePath).pipe(res);
  });
  app.polyservePackageName = packageName;
  return app;
}

function startServer(port, componentDir, packageName) {
  port = port || 8080;
  console.log('Starting Polyserve on port ' + port);

  var app = express();
  var polyserve = makeApp(componentDir, packageName);
  app.use('/components/', polyserve);

  console.log('Files in this directory are available at localhost:' +
      port + '/components/' + polyserve.polyservePackageName + '/...');

  var log = require('http2/test/util').createLogger('server');
  var options = {
    log: log,
    key: fs.readFileSync(path.join(__dirname, '../ssl/server.key'), {encoding: 'utf8'}),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'), {encoding: 'utf8'}),
    // secureProtocol: 'TLSv1_server_method',
    secureOptions: ['SSL_OP_NO_SSLv2'],
  };
  var server = http.createServer(options, app);
  server.listen(port);
}

module.exports = {
  makeApp: makeApp,
  startServer: startServer,
};
