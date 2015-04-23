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
var path = require('path');
var parseUrl = require('url').parse;
var send = require('send');
var bowerConfig = require('./bower').config;

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
  packageName = packageName || bowerConfig().name;

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
  app.packageName = packageName;
  return app;
}

module.exports = makeApp;
