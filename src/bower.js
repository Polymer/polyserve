/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

function bowerConfigPath() {
  return path.resolve(process.cwd(), 'bower.json');
}

function bowerConfigContents() {
  var contents;

  try {
    contents = fs.readFileSync(bowerConfigPath());
  } catch (e) {
    console.error('Error reading config at ' + bowerConfigPath());
    console.error(e);
  }

  return contents || '{}';
}

function config() {
  try {
    return JSON.parse(bowerConfigContents());
  } catch (e) {
    console.error('Could not parse bower.json');
    console.error(e);
  }

  return {};
}

function install(cb) {
  var proc = spawn('bower', ['install'], {stdio: 'inherit'});
  proc.on('close', cb);
}

module.exports = {
  config: config,
  install: install
};
