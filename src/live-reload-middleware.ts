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

import {Request, Response} from 'express';
import * as dom5 from 'dom5';
import {ASTNode} from 'parse5';

import {ResponseTransformer, getContentType, isSuccessful} from './transform-middleware';

export const liveReloadAppend: ResponseTransformer = {
  shouldTransform(_request: Request, response: Response) {
    return isSuccessful(response) && getContentType(response) === 'text/html';
  },

  transform(_request: Request, _response: Response, body: string): string {
    // Do not transform any other mimeType
    return body;
  },

  transformHTML(_request: Request, _response: Response, _body: string, document: ASTNode): ASTNode {
    const head = dom5.query(document, dom5.predicates.hasTagName('head'));
    if (!head) {
      return document;
    }
    const HTMLImport = dom5.constructors.element('link');
    dom5.setAttribute(HTMLImport, 'rel', 'import');
    dom5.setAttribute(HTMLImport, 'href', '/_polyserve/live-reload.html');
    dom5.append(head, HTMLImport);
    return document;
  },
};
