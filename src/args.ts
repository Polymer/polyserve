/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/// <reference path="../custom_typings/command-line-args.d.ts" />

import {ArgDescriptor} from 'command-line-args';

export let args: ArgDescriptor[] = [
  {
    name: 'version',
    alias: 'v',
    description: 'Print version info',
    type: Boolean,
  },
  {
    name: 'root',
    description: 'The root directory. Defaults to cwd',
    type: String,
    defaultOption: true,
  },
  {
    name: 'compile',
    description: 'Compiler options. Valid values are "auto", "always" and ' +
        '"never". "auto" compiles JavaScript to ES5 for browsers that don\'t ' +
        'fully support ES6.',
    type: String,
    defaultValue: 'auto',
  },
  {
    name: 'port',
    alias: 'p',
    description: 'The port to serve from. Defaults to 8080',
    type: Number,
  },
  {
    name: 'hostname',
    alias: 'H',
    description: 'The hostname to serve from. Defaults to localhost',
    type: String,
  },
  {
    name: 'component-dir',
    alias: 'c',
    description: 'The component directory to use. Defaults to reading from' +
        ' the Bower config (usually bower_components/)',
    type: String,
  },
  {
    name: 'package-name',
    alias: 'n',
    description: 'The package name to use for the root directory. Defaults to' +
        ' reading from bower.json',
    type: String,
  },
  {
    name: 'open',
    alias: 'o',
    description: 'The page to open in the default browser on startup.',
    type: Boolean,
  },
  {
    name: 'browser',
    alias: 'b',
    description: 'The browser(s) to open with when using the --open option.' +
        ' Defaults to your default web browser.',
    type: String,
    multiple: true,
  },
  {
    name: 'open-path',
    description: 'The URL path to open when using the --open option.' +
        ' Defaults to "index.html".',
    type: String,
  },
  {
    name: 'protocol',
    alias: 'P',
    description: 'The server protocol to use {h2, https/1.1, http/1.1}.' +
        ' Defaults to "http/1.1".',
    defaultValue: 'http/1.1',
    type: String,
  },
  {
    name: 'key',
    description: 'Path to TLS certificate private key file for https.' +
        ' Defaults to "key.pem".',
    defaultValue: 'key.pem',
    type: String,
  },
  {
    name: 'cert',
    description: 'Path to TLS certificate file for https.' +
        ' Defaults to "cert.pem".',
    defaultValue: 'cert.pem',
    type: String,
  },
  {
    name: 'manifest',
    description: 'Path to h2-push manifest',
    type: String,
  },
  {
    name: 'proxy-root',
    description: 'Top-level folder that should be redirected to the proxy-target. E.g. `foo` when you want to redirect all requests of `https://localhost/foo/`',
    type: String,
  },
  {
    name: 'proxy-target',
    description: 'Host url to proxy to, for example `https://myredirect:8080/foo`',
    type: String,
  },
];
