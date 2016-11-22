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

import {ArgDescriptor} from 'command-line-args';
import * as express from 'express';
import * as fs from 'mz/fs';
import * as path from 'path';
import * as http from 'spdy';
import * as url from 'url';

import {args} from './args';
import {getServerUrls, ServerOptions, startServers, startWithPort} from './start_server';

import commandLineArgs = require('command-line-args');
import commandLineUsage = require('command-line-usage');
import {nextOpenPort} from './internal/next_open_port';


export async function run(): Promise<void> {
  const argsWithHelp: ArgDescriptor[] = args.concat({
    name: 'help',
    description: 'Shows this help message',
    type: Boolean,
  });

  let cliOptions: any;

  try {
    cliOptions = commandLineArgs(argsWithHelp);
  } catch (e) {
    printUsage(argsWithHelp);
    return;
  }

  const options: ServerOptions = {
    root: cliOptions.root,
    port: cliOptions.port,
    hostname: cliOptions.hostname,
    open: cliOptions.open,
    browser: cliOptions['browser'],
    openPath: cliOptions['open-path'],
    componentDir: cliOptions['component-dir'],
    packageName: cliOptions['package-name'],
    protocol: cliOptions['protocol'],
    keyPath: cliOptions['key'],
    certPath: cliOptions['cert'],
    pushManifestPath: cliOptions['manifest'],
  }

  if (cliOptions.help) {
    printUsage(argsWithHelp);
    return;
  }
  if (cliOptions.version) {
    console.log(getVersion());
    return;
  }

  const serverInfos = await startServers(options);

  if (serverInfos.length === 1) {
    const urls = getServerUrls(options, serverInfos[0]!.server);
    console.log(`Files in this directory are available under the following URLs
    applications: ${
                  url.format(urls.serverUrl)}
    reusable components: ${url.format(urls.componentUrl)}
  `)
  } else {
    const dispatchServer = serverInfos.find(s => s.kind === 'dispatch');
    if (!dispatchServer) {
      throw new Error(
          'Internal Error: Launched multiple servers but ' +
          'didn\'t launch a dispatch server.');
    }
    const urls = getServerUrls(options, dispatchServer.server);
    console.log(`Started multiple servers with different variants:
    Dispatch server: ${url.format(urls.serverUrl)}`);
  }
}

function printUsage(options: any): void {
  const usage = commandLineUsage([{
    header: 'A development server for Polymer projects',
    title: 'polyserve',
    optionList: options,
  }]);
  console.log(usage);
}

function getVersion(): string {
  const packageFilePath = path.resolve(__dirname, '../package.json');
  const packageFile = fs.readFileSync(packageFilePath).toString();
  const packageJson = JSON.parse(packageFile);
  const version = packageJson['version'];
  return version;
}
