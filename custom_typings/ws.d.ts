declare module 'ws' {
  import * as http from 'spdy';
  interface WebSocketServerOptions {
    server: http.Server;
  }
  export class Server {
    constructor(options: WebSocketServerOptions)
    on(event: 'connection', cb: (client: WebSocket) => void): this;
    close(cb?: () => void): this;
  }
  export class WebSocket {
    status: number;
    message: string;
    send(data: any, cb?: (err: Error) => void): void;
    on(event: 'message', cb: (data: any, flags: {}) => any): void;
    on(event: 'close', cb: () => any): void;
  }
}
