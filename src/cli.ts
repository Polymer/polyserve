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
import {ServerOptions, applyDefaultOptions, getServerUrls, startServer, startWithPort} from './start_server';

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

  const root = options.root || process.cwd();
  const filesInRoot = await fs.readdir(root);
  const variantNames = filesInRoot
                           .map(f => {
                             const match = f.match(/^bower_components-(.*)/!);
                             return match && match[1];
                           })
                           .filter(f => f != null && f !== '');
  if (variantNames.length > 0) {
    await startVariants(options, variantNames);
    return;
  }

  const server = await startServer(options);
  /**
   *Files in this directory are available under the following URLs
    applications: http://localhost:8080
    reusable components: http://localhost:8080/components/polyserve-test/

   */
  const {serverUrl, componentUrl} = getServerUrls(options, server);
  console.log(`Files in this directory are available under the following URLs
    applications: ${url.format(serverUrl)}
    reusable components: ${url.format(componentUrl)}
  `);
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

async function startVariants(options: ServerOptions, variantNames: string[]) {
  const mainlineOptions = Object.assign({}, options);
  mainlineOptions.port = 0;
  const mainServer = await startServer(mainlineOptions);
  const variantServers = new Map<string, http.Server>();

  for (const variant of variantNames) {
    const variantOpts = Object.assign({}, options);
    variantOpts.port = 0;
    variantOpts.componentDir = `bower_components-${variant}`;
    variantServers.set(variant, await startServer(variantOpts));
  };

  const metaServer = await startMetaServer(options, mainServer, variantServers);
  const {serverUrl} = getServerUrls(options, metaServer);

  console.log(`Started multiple servers, serving different variants.
    dispatch server: ${url.format(serverUrl)}
  `);
}

async function startMetaServer(
    options: ServerOptions,
    mainlineServer: http.Server,
    variantServers: Map<string, http.Server>) {
  const fullOptions = await applyDefaultOptions(options);
  const app = express();
  app.get('/api/serverInfo', (req, res) => {
    res.contentType('json');
    res.send(JSON.stringify({
      packageName: fullOptions.packageName,
      mainlineServer: {
        port: mainlineServer.address().port,
      },
      variants: Array.from(variantServers.entries()).map(([name, server]) => {
        return {name, port: server.address().port};
      })
    }));
    res.end();
  });
  const indexPath = path.join(__dirname, '..', 'static', 'index.html');
  app.get('/', async(req, res) => {
    res.contentType('html');
    const indexContents = await fs.readFile(indexPath, 'utf-8');
    res.send(indexContents);
    res.end();
  });
  return startWithPort(fullOptions, app);
}
