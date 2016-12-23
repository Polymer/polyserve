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

import {Request, RequestHandler, Response} from 'express';
import {parse as parseContentType} from 'content-type';
import * as parse5 from 'parse5';

export function getContentType(response: Response) {
  const contentTypeHeader = response.getHeader('Content-Type');
  return contentTypeHeader && parseContentType(contentTypeHeader).type;
}

export function isSuccessful(response: Response) {
  const statusCode = response.statusCode;
  return (statusCode >= 200 && statusCode < 300);
}

export function transformResponse(transformers: ResponseTransformer[]):
    RequestHandler {
  return (req: Request, res: Response, next: () => void) => {
    let ended = false;

    const chunks: Buffer[] = [];

    let _shouldTransform: boolean = null;

    function shouldTransform() {
      if (_shouldTransform == null) {
        _shouldTransform = transformers.reduce((previous, transformer) => {
          return previous || !!transformer.shouldTransform(req, res);
        }, false);
      }
      return _shouldTransform;
    }

    const _write = res.write;
    res.write = function(
        chunk: Buffer|string,
        cbOrEncoding?: Function|string,
        cbOrFd?: Function|string): boolean {
      if (ended) {
        _write.call(this, chunk, cbOrEncoding, cbOrFd);
        return false;
      }

      if (shouldTransform()) {
        const buffer = (typeof chunk === 'string') ?
            new Buffer(chunk, cbOrEncoding as string) :
            chunk;
        chunks.push(buffer);
        return true;
      } else {
        return _write.call(this, chunk, cbOrEncoding, cbOrFd);
      }
    };

    const _end = res.end;
    res.end = function(
        chunk?: Buffer|string,
        cbOrEncoding?: Function|string,
        cbOrFd?: Function|string): boolean {
      if (ended)
        return false;
      ended = true;

      if (shouldTransform()) {
        const body = Buffer.concat(chunks).toString('utf8');
        let newBody = body;
        try {
          if (getContentType(res) === 'text/html') {
            newBody = parse5.serialize(
              transformers.reduce((document, transformer) => {
                return transformer.transformHTML(req, res, body, document);
              }, parse5.parse(body))
            );
          } else {
            newBody = transformers.reduce((body, transformer) => {
              return transformer.transform(req, res, body);
            }, body);
          }
        } catch (e) {
          console.warn('Error', e);
        }
        // TODO(justinfagnani): re-enable setting of content-length when we know
        // why it was causing truncated files. Could be multi-byte characters.
        // Assumes single-byte code points!
        // res.setHeader('Content-Length', `${newBody.length}`);
        res.removeHeader('Content-Length');
        return _end.call(this, newBody);
      } else {
        return _end.call(this, chunk, cbOrEncoding, cbOrFd);
      }
    };

    next();
  };
}

export interface ResponseTransformer {
  /**
   * Returns `true` if this transformer should be invoked.
   * Transformers should only look at headers, do not call res.write().
   */
  shouldTransform(request: Request, response: Response): boolean;

  transform(request: Request, response: Response, body: string): string;
  transformHTML(request: Request, response: Response, body: string, document: parse5.ASTNode): parse5.ASTNode;
}
