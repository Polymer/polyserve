/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const startServerModule = require('../lib/start_server');
const assert = require('chai').assert;
const sinon = require('sinon');
const cliRun = require('../lib/cli').run;
const supertest = require('supertest');

suite('lib/start_server', () => {
  suite('getApp', () => {

    test('returns an app', () => {
      let app = startServerModule.getApp({});
      assert.isOk(app);
    });

    test('serves root application files', (done) => {
      let app = startServerModule.getApp({
        root: __dirname,
      });
      supertest(app)
        .get('/test-file.txt')
        .expect(200, 'PASS\n')
        .end(done);
    });

    test('serves component files', (done) => {
      let app = startServerModule.getApp({
        root: __dirname,
      });
      supertest(app)
        .get('/bower_components/test-component/test-file.txt')
        .expect(200, 'TEST COMPONENT\n')
        .end(done);
    });

    test('serves index.html, not 404', (done) => {
      let app = startServerModule.getApp({
        root: __dirname,
      });
      supertest(app)
        .get('/foo')
        .expect(200, 'INDEX\n')
        .end(done);
    });

    test('unknown cmd parameter should not throw exception', (done) => {
      var argv = process.argv;

      process.argv = ["node", "polyserve", "--unknown-parameter"];
      var result = cliRun();

      result.then(function() {
        process.argv = argv;
        done();
      }, function(err) {
        process.argv = argv;
        done(err);
      });
    });

  });

  suite('startServerWithCliArgs', () => {

    test('calls startServer() with properly formatted & translated ServerOptions', () => {
      let userOptions = {
        root: 'ROOT',
        port: 1234,
        hostname: 'HOSTNAME',
        open: true,
        'open-browser': true,
        'open-path': 'OPEN PATH',
        'component-dir': 'COMPONENT DIR',
        'package-name': 'PACKAGE-NAME',
      };
      let expectedParsedOptions = {
        root: userOptions.root,
        port: userOptions.port,
        hostname: userOptions.hostname,
        open: userOptions.open,
        openBrowser: userOptions['open-browser'],
        openPath: userOptions['open-path'],
        componentDir: userOptions['component-dir'],
        packageName: userOptions['package-name'],
      };
      startServerModule.startServer = sinon.stub();
      startServerModule.startServerWithCliArgs(userOptions);
      assert.isOk(startServerModule.startServer.calledWithMatch(expectedParsedOptions));
    });

  })
  ;
});

