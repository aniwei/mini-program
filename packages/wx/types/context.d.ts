import { ProxyPod } from '@catalyze/basic';
export interface MessagePayloadParameters extends Iterable<unknown> {
    0: string;
    1: unknown;
    2: number | unknown;
}
export interface MessagePayload {
    parameters: MessagePayloadParameters;
}
export type WxJSEvents = 'init' | 'connected' | 'pluginloaded' | 'inited' | 'started' | 'publish' | 'subscribe' | 'callback' | 'invoke' | 'created' | 'destroy' | 'remove' | 'active' | 'inactive' | 'status' | 'blur' | 'focus';
export declare abstract class WxJS extends ProxyPod {
    invokeHandler(...rests: unknown[]): void;
    handleInvoke(...rests: unknown[]): void;
    publishHandler(...rests: unknown[]): void;
    handlePublish(...rests: unknown[]): void;
    subscribeHandler(...rests: unknown[]): void;
    handleSubscribe(...rests: unknown[]): void;
    eval(code: string, sourceURL?: string): void;
}
export interface WxConfigs {
}
export interface WxSettings {
    size: {
        width: number;
        height: number;
    };
    scene: number;
    path: string;
    entry: string;
    account: object;
    env: {
        USER_DATA_PATH: string;
    };
}
export interface WxInit {
    id?: string | number;
    path?: string;
    data: unknown;
    settings: WxSettings;
    configs: WxConfigs;
}
export declare abstract class WxContext extends WxJS {
    protected _configs: WxConfigs | null;
    get configs(): WxConfigs;
    set configs(configs: WxConfigs);
    protected _settings: WxSettings | null;
    get settings(): WxSettings;
    set settings(settings: WxSettings);
    constructor();
    isWxContextReady(): void;
    subscribe(name: string, data: unknown, ids: number): void;
}
