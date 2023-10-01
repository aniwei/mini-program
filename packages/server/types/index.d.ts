import { WxApp } from './wx';
import type { WxProj } from '@catalyze/types';
export interface WxApplicationOptions {
    port: number;
    proj: WxProj;
}
export declare const createWxApplication: (options: WxApplicationOptions) => WxApp;
