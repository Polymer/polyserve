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

import * as babelCore from 'babel-core';
import {ASTNode, serialize, parse} from 'parse5';
import * as dom5 from 'dom5';
import {Request, Response} from 'express';
import * as LRU from 'lru-cache';
import {UAParser} from 'ua-parser-js';

import {ResponseTransformer, getContentType, isSuccessful} from './transform-middleware';

const babelTransformers = [
  'babel-plugin-transform-es2015-arrow-functions',
  'babel-plugin-transform-es2015-block-scoped-functions',
  'babel-plugin-transform-es2015-block-scoping',
  'babel-plugin-transform-es2015-classes',
  'babel-plugin-transform-es2015-computed-properties',
  'babel-plugin-transform-es2015-destructuring',
  'babel-plugin-transform-es2015-duplicate-keys',
  'babel-plugin-transform-es2015-for-of',
  'babel-plugin-transform-es2015-function-name',
  'babel-plugin-transform-es2015-literals',
  'babel-plugin-transform-es2015-object-super',
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-shorthand-properties',
  'babel-plugin-transform-es2015-spread',
  'babel-plugin-transform-es2015-sticky-regex',
  'babel-plugin-transform-es2015-template-literals',
  'babel-plugin-transform-es2015-typeof-symbol',
  'babel-plugin-transform-es2015-unicode-regex',
  'babel-plugin-transform-regenerator',
].map((name) => require(name));

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

// NOTE: To change the max length of the cache at runtime, just use bracket
// notation, i.e. `babelCompileCache['max'] = 64 * 1024` for 64KB limit.
export const babelCompileCache = LRU<string>(<LRU.Options<string>>{
  length: (n: string, key: string) => n.length + key.length
});


export function babelCompile(forceCompile: boolean): ResponseTransformer {
  if (forceCompile == null) {
    forceCompile = false;
  }

  return {
    shouldTransform(_request: Request, response: Response) {
      return isSuccessful(response) &&
          compileMimeTypes.indexOf(getContentType(response)) >= 0;
    },

    transform(request: Request, response: Response, body: string): string /**/ {
      const contentType = getContentType(response);

      if (forceCompile || needCompilation(request)) {
        const source = body;
        const cached = babelCompileCache.get(source);
        if (cached !== undefined) {
          return cached;
        }
        if (javaScriptMimeTypes.indexOf(contentType) !== -1) {
          body = compileScript(source);
        }
        babelCompileCache.set(source, body);
      }

      return body;
    },

    transformHTML(request: Request, _response: Response, body: string, document: ASTNode): ASTNode {
      if (forceCompile || needCompilation(request)) {
        const cached = babelCompileCache.get(body);
        if (cached !== undefined) {
          return parse(cached);
        }
        document = compileHtml(document, request.path);
        babelCompileCache.set(body, serialize(document));
      }

      return document;
    }
  };
}

function compileHtml(document: ASTNode, location: string): ASTNode {
  const scriptTags = dom5.queryAll(document, isInlineJavaScript);
  for (const scriptTag of scriptTags) {
    try {
      const script = dom5.getTextContent(scriptTag);
      const compiledScriptResult = compileScript(script);
      dom5.setTextContent(scriptTag, compiledScriptResult);
    } catch (e) {
      // By not setting textContent we keep the original script, which
      // might work. We may want to fail the request so a better error
      // shows up in the network panel of dev tools. If this is the main
      // page we could also render a message in the browser.
      console.warn(`Error compiling script in ${location}: ${e.message}`);
    }
  }
  return document;
}

function compileScript(script: string): string {
  return babelCore
      .transform(script, {
        plugins: babelTransformers,
      })
      .code;
}

const isInlineJavaScript = dom5.predicates.AND(
    dom5.predicates.hasTagName('script'),
    dom5.predicates.NOT(dom5.predicates.hasAttr('src')));

function needCompilation(request: Request): boolean {
  const uaParser = new UAParser(request.headers['user-agent']);
  const browser = uaParser.getBrowser();
  const versionSplit = browser.version && browser.version.split('.');
  const majorVersion = versionSplit ? parseInt(versionSplit[0], 10) : -1;

  const supportsES2015 = (browser.name === 'Chrome' && majorVersion >= 49) ||
      (browser.name === 'Safari' && majorVersion >= 10) ||
      (browser.name === 'Edge' && majorVersion >= 14) ||
      (browser.name === 'Firefox' && majorVersion >= 51);
  return !supportsES2015;
}
