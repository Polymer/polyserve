declare module 'browser-sync' {

  namespace browserSync {

    interface Options {
      proxy: string,
      files: string[]
    }

    interface BrowserSyncInstance {
      /** the name of this instance of browser-sync */
      name: string;
      /**
       * Start the Browsersync service. This will launch a server, proxy or start the snippet mode
       * depending on your use-case.
       */
      init(config?: Options, callback?: (err: Error, bs: Object) => any): BrowserSyncInstance;
      /**
       * Reload the browser
       * The reload method will inform all browsers about changed files and will either cause the browser
       * to refresh, or inject the files where possible.
       */
      reload(): void;
      /**
       * Reload a single file
       * The reload method will inform all browsers about changed files and will either cause the browser
       * to refresh, or inject the files where possible.
       */
      reload(file: string): void;
      /**
       * Reload multiple files
       * The reload method will inform all browsers about changed files and will either cause the browser
       * to refresh, or inject the files where possible.
       */
      reload(files: string[]): void;
      /**
       * The reload method will inform all browsers about changed files and will either cause the browser
       * to refresh, or inject the files where possible.
       */
      reload(options: { stream: boolean }): NodeJS.ReadWriteStream;
      /**
       * This method will close any running server, stop file watching & exit the current process.
       */
      exit(): void;
      /**
       * Method to pause file change events
       */
      pause(): void;
      /**
       * Method to resume paused watchers
       */
      resume(): void;
      /**
       * The internal Event Emitter used by the running Browsersync instance (if there is one). You can use
       * this to emit your own events, such as changed files, logging etc.
       */
      emitter: NodeJS.EventEmitter;
      /**
       * A simple true/false flag that you can use to determine if there's a currently-running Browsersync instance.
       */
      active: boolean;
      /**
       * A simple true/false flag to determine if the current instance is paused
       */
      paused: boolean;
    }

    interface BrowserSyncFactory {
      /**
       * Start the Browsersync service. This will launch a server, proxy or start the snippet mode
       * depending on your use-case.
       */
      (config?: Options, callback?: (err: Error, bs: Object) => any): BrowserSyncInstance;
      /**
       * Create a Browsersync instance
       * @param name an identifier that can used for retrieval later
       */
      create(name?: string): BrowserSyncInstance;
      /**
       * Get a single instance by name. This is useful if you have your build scripts in separate files
       * @param name the identifier used for retrieval
       */
      get(name: string): BrowserSyncInstance;
      /**
       * Check if an instance has been created.
       * @param name the name of the instance
       */
      has(name: string): boolean;
    }

  }

  const browserSync: browserSync.BrowserSyncFactory;
  export = browserSync;
}
