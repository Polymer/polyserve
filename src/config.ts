/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
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

import * as fs from 'fs';
import * as path from 'path';
import {ServerOptions} from './start_server';

function readConfigSync(filename: string, root?: string): any {
  const configPath = path.resolve(root || '', filename);
  let config: any;
  try {
    config = fs.readFileSync(configPath, 'utf-8');
  } catch (e) {
    return {};
  }
  try {
    return JSON.parse(config);
  } catch (e) {
    console.error(`Could not parse ${configPath}`);
    console.error(e);
  }
  return {};
}

/**
 * Determines the package name by reading from the following sources:
 *
 * 1. `options.packageName`
 * 2. bower.json, if options.npm is not true
 * 3. package.json
 * 4. The name of the root directory
 */
export function getPackageName(options: ServerOptions) {
  return options.packageName ||
      !options.npm && readConfigSync('bower.json', options.root).name ||
      readConfigSync('package.json', options.root).name ||
      path.basename(options.root);
}

export function getComponentDir(options: ServerOptions) {
  // TODO(usergenic): The current behavior of polyserve is to use
  // bower_components for directory and components for url. We should
  // honor the value of `directory` of `.bowerrc` if found in the root dir
  // of the app, to get user-defined defaults.
  return options.componentDir ||
      (options.npm ? 'node_modules' : 'bower_components');
}
