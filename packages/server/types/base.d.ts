/// <reference types="node" />
import Koa from 'koa';
import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { WorkTransport } from '@catalyze/basic';
import * as Wx from '@catalyze/api';
declare class WxApi extends Wx.WxApi {
}
export declare class WxBase extends Koa {
    protected port: number;
    protected server: Server;
    protected ws: WebSocketServer;
    protected transport: WorkTransport | null;
    protected api: WxApi;
    constructor(port?: number);
    start(): Promise<void>;
    stop(): void;
}
export {};
