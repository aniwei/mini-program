import { BaseApi, MessageContent, MessageOwner, MessageTransport } from '@catalyze/basic';
import { WxAssetsBundle } from '@catalyze/asset';
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
export type WxApiEvent = `Auth.signIn` | `Auth.signOut` | `Auth.initialed` | `Auth.WxQRCodeStateKindChanged`;
export interface WxApiService<T extends string> extends BaseApi<WxApiEvent | T> {
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
        commands: {
            getWxAssetsBundle(): Promise<WxAssetsBundle>;
            compile(): Promise<string[]>;
            invoke(name: string, data: unknown, id: number): Promise<unknown>;
            login(): Promise<WxLogin>;
            createRequestTask(data: unknown): Promise<unknown>;
        };
        events: {
            publish(name: string, options: unknown, parameters: unknown[]): Promise<void>;
        };
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
export declare abstract class WxApiService<T extends string> extends BaseApi<WxApiEvent | T> {
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
