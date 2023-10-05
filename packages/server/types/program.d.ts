import { FSWatcher } from 'chokidar';
import { Axios } from 'axios';
import { WxAssetHash } from '@catalyzed/asset';
import { WxAssetsCompile } from '@catalyzed/compile';
import { Asset, AssetJSON, EventEmitter } from '@catalyzed/basic';
import type { WxProj } from '@catalyzed/types';
declare class MiniAssetsBundle extends WxAssetsCompile {
    search(): Promise<undefined>;
}
interface WxCachedOptions extends WxProj {
    dir: string;
}
interface AssetCache {
    relative: string;
    hash: string;
}
declare abstract class WxCached extends EventEmitter<'change'> {
    protected dir: string;
    protected root: string;
    protected appid: string;
    protected cached: AssetCache[];
    constructor(options: WxCachedOptions);
    read(): Promise<void>;
    write(): Promise<void>;
}
export type OnChangeHandle = (asset: Asset) => void;
export type OnUnlinkHandle = (asset: Asset) => void;
export interface WxProgramOptions extends WxCachedOptions {
    dir: string;
}
export declare class WxProgram extends WxCached {
    get interceptors(): {
        request: import("axios").AxiosInterceptorManager<import("axios").InternalAxiosRequestConfig<any>>;
        response: import("axios").AxiosInterceptorManager<import("axios").AxiosResponse<any, any>>;
    };
    protected axios: Axios;
    protected root: string;
    protected appid: string;
    protected bundle: MiniAssetsBundle;
    protected watcher: FSWatcher | null;
    constructor(options: WxProgramOptions);
    ensure(): Promise<void>;
    watch(): Promise<void>;
    stop(): void;
    start(): any;
    current(): WxProj;
    getWxAssetsBundle(assets: WxAssetHash[]): Promise<{
        root: string;
        assets: AssetJSON[];
    }>;
    login(): Promise<any>;
    createRequestTask(data: unknown): void;
}
export {};
