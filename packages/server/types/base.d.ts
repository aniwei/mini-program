/// <reference types="node" />
import Koa from 'koa';
import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { WorkTransport } from '@catalyze/basic';
import * as Wx from '@catalyze/api';
import type { ViteDevServer } from 'vite';
declare class WxApi extends Wx.WxApi {
}
export declare class WxBase extends Koa {
    protected _server: Server | null;
    get server(): Server;
    set server(server: Server);
    protected port: number;
    protected ws: WebSocketServer;
    protected api: WxApi;
    protected vite: ViteDevServer | null;
    protected transport: WorkTransport | null;
    constructor(port?: number);
    start(): Promise<void>;
    stop(): void;
}
export {};
