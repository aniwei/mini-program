import { Axios } from 'axios';
import { WxAssetsCompile } from '@catalyze/compile';
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
    getWxAssetsBundle(): Promise<undefined>;
    login(): Promise<any>;
    createRequestTask(data: unknown): void;
    start(): any;
}
export {};
