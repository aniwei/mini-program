import * as Api from '@catalyzed/api';
export type ReadyHandle = () => void;
export declare class WxApiTransport extends Api.WxApiTransport {
    connect(uri: string): void;
}
export declare class WxApi extends Api.WxApi {
    static create(): WxApi;
    uri: string | null;
    reconnect(): void;
    connect(uri: unknown): void;
    disconnect(): void;
}
