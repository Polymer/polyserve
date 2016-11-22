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

import {assert} from 'chai';
import {run as cliRun} from '../cli';
import intercept = require('intercept-stdout');

suite('cli', () => {
  // Why not do this setup and teardown in the setup() and teardown() methods?
  // because you don't want to trap stdout at test end, as that traps mocha's
  // output.
  // TODO(rictic): look into using spawn() to run polyserve in another process
  //     instead. That way we could actually get it started and run it for a
  //     while, hit it with requests, etc.
  async function runCli(args: string[]) {
    const originalArgv = process.argv;
    process.argv = ['node', 'polyserve'].concat(args);
    let stdout = '';
    let unintercept = intercept((txt) => {
      stdout += txt;
      return '';
    });

    try {
      await cliRun();
    } finally {
      unintercept();
      process.argv = originalArgv;
    }
    return stdout;
  }

  test('unknown cmd parameter should not throw exception', async() => {
    const stdout = await runCli(['--unknown-parameter']);

    // Assert that we printed something that looks kinda like help text to
    // stdout.
    assert.match(stdout, /A development server for Polymer projects/);
    assert.match(stdout, /--version/);
    assert.match(stdout, /--package-name/);
  });

});
