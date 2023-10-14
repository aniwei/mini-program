import { WxCapability, WxCapabilityFactory } from '../capability';
import { WxContext } from '../context';
import { ProxyView } from './proxy';
import { View } from './capability/view';
import { Utililty } from './capability/utility';
export interface WxViewLibs {
    view: View;
    utility: Utililty;
}
export declare class WxViewLibs extends WxContext {
    capabilities: WxCapability<ProxyView>[];
    deps: number;
    register(WxCapability: WxCapabilityFactory<ProxyView>, ...options: unknown[]): void;
    invokeCallbackHandler(id: number, data: unknown): void;
    invokeHandler(name: string, data: unknown, id: number): void;
}
