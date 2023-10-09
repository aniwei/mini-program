import { ApiSubscribables, AssetsBundleJSON, BaseApi, EventEmitter, MessageContent, MessageOwner, MessageTransport } from '@catalyzed/basic';
import { WxAssetHash } from '@catalyzed/asset';
import { WxProj } from '@catalyzed/types';
export declare enum WxQRCodeStateKind {
    Uncreated = "uncreated",
    Created = "created",
    Alive = "alive",
    Cancelled = "cancelled",
    Scanned = "scanned",
    Timeout = "timeout"
}
export interface WxQRCode {
    base64: string;
}
export interface WxUser {
    nickname: string;
    avatarURL: string;
}
export interface WxLogin {
    code: string;
    appname: string;
    appicon_url: string;
    state: string;
}
export type WxApiEventKind = `Auth.signIn` | `Auth.signOut` | `Auth.initialed` | `Auth.WxQRCodeStateKindChanged`;
export type WxProgramApiEventKind = `File.change`;
export interface WxProgramApiEvent extends EventEmitter<WxProgramApiEventKind> {
    publish(name: WxProgramApiEventKind, parameters: unknown[]): Promise<void>;
}
export interface WxProgramApiCommand extends ApiSubscribables {
    current(): Promise<WxProj>;
    getWxAssetsBundle(assets: WxAssetHash[]): Promise<AssetsBundleJSON>;
    compile(): Promise<string[]>;
    invoke(name: string, data: unknown, id: number): Promise<unknown>;
    login(): Promise<WxLogin>;
    createRequestTask(data: unknown): Promise<unknown>;
}
export interface WxApiService<T extends string> extends BaseApi<WxApiEventKind | T> {
    Auth: {
        commands: {
            getUser(): Promise<WxUser>;
            getAuthenticateWxQRCode(): Promise<string>;
        };
        events: {
            WxQRCodeStateKindChanged(status: WxQRCodeStateKind): Promise<void>;
            signIn(user: WxUser): Promise<void>;
        };
    };
    Program: {
        commands: WxProgramApiCommand;
        events: WxProgramApiEvent;
    };
}
export declare enum WxApiStateKind {
    Created = 1,
    Connecting = 2,
    Connected = 4,
    Ready = 8,
    Disconnected = 16,
    Error = 32
}
export type ReadyHandle = () => void;
export declare abstract class WxApiService<T extends string> extends BaseApi<WxApiEventKind | T> {
    constructor(transport?: MessageTransport);
}
export type WxApiQueueHandle = () => void;
export declare abstract class WxApi extends WxApiService<'ready' | 'connected' | 'disconnected' | 'error'> {
    state: WxApiStateKind;
    queue: WxApiQueueHandle[];
    constructor();
    send(content: MessageContent): Promise<MessageOwner>;
    connect(uri: unknown): void;
    disconnect(): void;
}
