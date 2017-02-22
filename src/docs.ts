/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
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

import * as fs from 'mz/fs';
// import * as path from 'path';

import {Analyzer} from 'polymer-analyzer';
import {FSUrlLoader} from 'polymer-analyzer/lib/url-loader/fs-url-loader';
import {generateElementMetadata} from 'polymer-analyzer/lib/generate-elements';

import {ServerOptions} from './start_server';
import express = require('express');

const resolvePath = require('resolve-path');

const isInTests = /(\b|\/|\\)(test)(\/|\\)/;

export function makeDocsApp(options: ServerOptions): express.Express {
  const app = express();
  const root = options.root || '.';
  app.get('*', async (req, res) => {
    const format = req.query['format'];

    if (format === 'elements-json') {
      let filePath = req.path;
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
      }
      const fullPath = resolvePath(root, filePath);
      const metadataFeatures = new Set();

      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        const analyzer = new Analyzer({
          urlLoader: new FSUrlLoader(fullPath),
          // urlResolver: new PackageUrlResolver(),
        });
        const _package = await analyzer.analyzePackage();
        _package
          .getByKind('element', {
            externalPackages: false,
          })
          .forEach((e) => metadataFeatures.add(e));
        _package
          .getByKind('element-mixin', {
            externalPackages: false,
          })
          .forEach((m) => metadataFeatures.add(m));
      } else {
        const analyzer = new Analyzer({
          urlLoader: new FSUrlLoader(root),
          // urlResolver: new PackageUrlResolver(),
        });
        const document = await analyzer.analyze(filePath);
        document
            .getByKind('element', {
              externalPackages: false,
            })
            .forEach((e) => metadataFeatures.add(e));
        document
            .getByKind('element-mixin', {
              externalPackages: false,
            })
            .forEach((e) => metadataFeatures.add(e));
      }
      const nonTestFeatures =
      Array.from(metadataFeatures)
          .filter((e) => !isInTests.test(e.sourceRange.file));
      const metadata = generateElementMetadata(nonTestFeatures, '');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(metadata));
    } else {
      // serve docs app shell
    }
  });

  return app;
}
