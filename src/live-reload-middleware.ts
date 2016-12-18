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

import {Request, RequestHandler, Response} from 'express';
import * as dom5 from 'dom5';
import * as parse5 from 'parse5';

import {transformResponse, getContentType, isSuccessful} from './transform-middleware';

export const liveReloadAppend: RequestHandler =
  transformResponse({
    shouldTransform(_request: Request, response: Response) {
      return isSuccessful(response) && getContentType(response) === 'text/html';
    },

    transform(_request: Request, _response: Response, body: string): string {
      if (!body) {
        return body;
      }
      const document = parse5.parse(body);
      const head = dom5.query(document, dom5.predicates.hasTagName('head'));
      const HTMLImport = dom5.constructors.element('link');
      dom5.setAttribute(HTMLImport, 'rel', 'import');
      dom5.setAttribute(HTMLImport, 'href', '/_polyserve/live-reload.html');
      dom5.append(head, HTMLImport);
      return parse5.serialize(document);
    },
  });
