import { WxAuth } from './auth';
import { MiniProgram } from './program';
import type { WxProj } from '@catalyze/types';
export type AppStartCallback = () => void;
export interface WxProgram {
    appid: string;
}
export interface WxAppOptions {
    port: number;
    proj: WxProj;
}
export declare class WxApp extends WxAuth {
    proj: WxProj;
    program: MiniProgram;
    constructor(options: WxAppOptions);
    start(): Promise<void>;
}
