import { WxCapability, WxCapabilityFactory } from '../capability';
import { WxContext } from '../context';
import { ProxyApp } from './proxy';
import { Controller } from './capability/controller';
import { FS } from './capability/fs';
import { Network } from './capability/network';
import { System } from './capability/system';
import { User } from './capability/user';
import { UI } from './capability/ui';
export interface WxAppLibs {
    controller: Controller;
    fs: FS;
    network: Network;
    storage: Storage;
    system: System;
    user: User;
    request: Request;
    ui: UI;
}
export declare class WxAppLibs extends WxContext {
    capabilities: WxCapability<ProxyApp>[];
    deps: number;
    register(WxCapability: WxCapabilityFactory<ProxyApp>, ...options: unknown[]): void;
    invokeCallbackHandler(id: number, data: unknown): void;
    invokeHandler(name: string, data: unknown, id: number): void;
}
