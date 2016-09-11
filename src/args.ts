/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {ArgDescriptor} from 'command-line-args';

export let args : ArgDescriptor[] = [
  {
    name: 'version',
    description: 'Print version info',
    type: Boolean,
  },
  {
    name: 'verbose',
    description: 'turn on debugging output',
    type: Boolean,
    alias: 'v',
  },
  {
    name: 'quiet',
    description: 'silence output',
    type: Boolean,
    alias: 'q',
  },
  {
    name: 'root',
    description: 'The root directory. Defaults to cwd',
    type: String,
    defaultOption: true,
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
];
