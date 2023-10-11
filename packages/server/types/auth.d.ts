import { WxUser } from '@catalyzed/api';
import { WxStore } from './store';
import { WxScanCheck } from './basic/check';
export declare class WxAuth extends WxStore {
    protected _code: string | null;
    get code(): string | null;
    set code(code: string | null);
    protected checker: WxScanCheck | null;
    constructor();
    /**
     * 获取用户信息及票据
     * @param {string} code
     * @returns {WxUser}
     */
    getUser(code: string): Promise<WxUser & {
        ticket: string;
        signature: string;
    }>;
    getAuthenticateWxQRCode(): Promise<string>;
}
