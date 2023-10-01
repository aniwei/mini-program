import { Axios } from 'axios';
import { WxAssetsCompile } from '@catalyze/compile';
import type { WxProj } from '@catalyze/types';
declare class MiniAssetsBundle extends WxAssetsCompile {
    search(): Promise<undefined>;
}
export declare class MiniProgram extends Axios {
    protected _appid: string | null;
    get appid(): string;
    protected root: string;
    protected bundle: MiniAssetsBundle;
    constructor(proj: WxProj);
    ensure(): Promise<void>;
    getWxAssetsBundle(): Promise<{
        root: string;
        assets: import("@catalyze/basic").Asset[];
    }>;
    login(): Promise<any>;
    createRequestTask(data: unknown): void;
    start(): any;
}
export {};
