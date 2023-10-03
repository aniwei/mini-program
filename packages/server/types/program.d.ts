import { Axios } from 'axios';
import { WxAssetHash } from '@catalyze/asset';
import { WxAssetsCompile } from '@catalyze/compile';
import { AssetJSON } from '@catalyze/basic';
import type { WxProj } from '@catalyze/types';
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
declare abstract class WxCached extends Axios {
    protected dir: string;
    protected root: string;
    protected appid: string;
    protected cached: AssetCache[];
    constructor(options: WxCachedOptions);
    read(): Promise<void>;
    write(): Promise<void>;
}
export interface WxProgramOptions extends WxCachedOptions {
    dir: string;
}
export declare class WxProgram extends WxCached {
    protected bundle: MiniAssetsBundle;
    constructor(options: WxProgramOptions);
    ensure(): Promise<void>;
    current(): {
        root: string;
        appid: string;
    };
    getWxAssetsBundle(assets: WxAssetHash[]): Promise<{
        root: string;
        assets: import("@catalyze/basic").Asset[];
    } | {
        root: string;
        assets: AssetJSON[];
    }>;
    login(): Promise<any>;
    createRequestTask(data: unknown): void;
    start(): any;
}
export {};
