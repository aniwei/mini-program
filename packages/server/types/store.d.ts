import { WxUser } from '@catalyzed/api';
import { WxBase } from './base';
export declare class WxStore extends WxBase {
    protected dir: string;
    protected ticket: string | null;
    protected signature: string | null;
    protected user: WxUser | null;
    os: string;
    platform: string;
    version: string;
    constructor();
    resolve(appid: string): string;
    ensure(): Promise<void>;
    clean(): Promise<void>;
    read(): Promise<void>;
    start(): Promise<void>;
    store(): Promise<void>;
}
