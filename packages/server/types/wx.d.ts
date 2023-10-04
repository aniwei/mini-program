import { WxAuth } from './auth';
import { WxProgram } from './program';
import type { WxProj } from '@catalyze/types';
export type AppStartCallback = () => void;
export interface WxAppOptions {
    port: number;
    proj: WxProj;
}
export declare class WxApp extends WxAuth {
    proj: WxProj;
    program: WxProgram;
    constructor(options: WxAppOptions);
    start(): Promise<void>;
}
