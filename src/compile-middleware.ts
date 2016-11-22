/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import * as babelCore from 'babel-core';
import {RequestHandler, Request, Response} from 'express';
import { transformResponse } from './transform-middleware';

import {UAParser} from 'ua-parser-js';
import * as parse5 from 'parse5';
import * as dom5 from 'dom5';
import {parse as parseContentType} from 'content-type';

const babelLatest = require('babel-preset-latest');

const javaScriptMimeTypes = [
  'application/javascript',
  'application/ecmascript',
  'text/javascript',
  'text/ecmascript',
];

const htmlMimeType = 'text/html';

const compileMimeTypes = [
  htmlMimeType,
].concat(javaScriptMimeTypes);

function getContentType(response: Response) {
  const contentTypeHeader = response.getHeader('Content-Type');
  return contentTypeHeader && parseContentType(contentTypeHeader).type;
}

function isSuccessful(response: Response) {
  const statusCode = response.statusCode;
  return (statusCode >= 200 && statusCode < 300);
}

export const babelCompile: RequestHandler = transformResponse({
  shouldTransform(request: Request, response: Response) {
    return isSuccessful(response) &&
        compileMimeTypes.indexOf(getContentType(response)) >= 0;
  },

  transform(request: Request, response: Response, body: string): string {
    const contentType = getContentType(response);
    const uaParser = new UAParser(request.headers['user-agent']);
    const compile = needCompilation(uaParser);

    if (compile) {
      // TODO(justinfagnani): cache compilation results
      if (contentType === htmlMimeType) {
        const document = parse5.parse(body);
        const scriptTags = dom5.queryAll(document, isInlineJavaScript);
        for (const scriptTag of scriptTags) {
          try {
            const script = dom5.getTextContent(scriptTag);
            const compiledScriptResult = babelCore.transform(script, {
              presets: [babelLatest],
            });
            dom5.setTextContent(scriptTag, compiledScriptResult.code);
          } catch (e) {
            // By not setting textContent we keep the original script, which
            // might work. We may want to fail the request so a better error
            // shows up in the network panel of dev tools. If this is the main
            // page we could also render a message in the browser.
            console.warn(`Error compiling script in ${request.path}: ${e}`);
          }
        }
        return parse5.serialize(document);
      } else if (javaScriptMimeTypes.indexOf(contentType) >= 0) {
        try {
          const compiledScriptResult = babelCore.transform(body, {
            presets: [babelLatest],
          });
          return compiledScriptResult.code;
        } catch (e) {
          console.warn(`Error compiling script in ${request.path}: ${e}`);
        }
      }
    }
    return body;
  },
});

const isInlineJavaScript = dom5.predicates.AND(
  dom5.predicates.hasTagName('script'),
  dom5.predicates.NOT(dom5.predicates.hasAttr('src')));

function needCompilation(uaParser: UAParser): boolean {
  const engine = uaParser.getEngine();
  const browser = uaParser.getBrowser();
  const versionSplit = browser.version && browser.version.split('.');
  const majorVersion = versionSplit ? parseInt(versionSplit[0], 10) : -1;

  const supportsES6 =
      (browser.name === 'Chrome' && majorVersion >= 49) ||
      (browser.name === 'Safari' && majorVersion >= 10) ||
      (browser.name === 'Edge' && majorVersion >= 14);
  return !supportsES6;
}
