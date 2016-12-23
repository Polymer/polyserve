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

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'mz/fs';
import * as path from 'path';
import * as http from 'spdy';
import * as supertest from 'supertest-as-promised';

import {startServer} from '../start_server';

const WebSocket = require('ws');
chai.use(chaiAsPromised);
const assert = chai.assert;

const root = path.join(__dirname, '..', '..', 'test');

suite('live-reload-middleware', () => {

  let app: http.Server;

  const changedFilePath = path.join(root, 'bower_components', 'change-file.txt');

  setup(async () => {
    fs.writeFileSync(changedFilePath, 'Original content');
    app = await startServer({
      root: root,
      liveReloadPath: path.join(root, 'bower_components/')
    });
  });

  teardown(async () => {
    fs.unlink(changedFilePath);
    await app.close();
  });

  test('sends websocket message when file changes', (done) => {
    const address = app.address();
    const ws = new WebSocket(`ws://${address.address}:${address.port}`);
    ws.on('message', () => {
      done();
    });
    // Timeout to correctly trigger the change event for chokidar.
    setTimeout(() => {
      fs.writeFileSync(changedFilePath, 'Changed content');
    }, 100);
  });

  test('requesting HTML adds HTML import to head', async() => {
    const response =
        await supertest(app).get('/components/test-component/test.html');
    assert.include(response.text, '<link rel="import" href="/_polyserve/live-reload.html"></head>');
  });

});
