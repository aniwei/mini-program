import { ProxyApp } from '..';
import { WxCapability } from '../../capability';
export declare class System extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(proxy: ProxyApp): Promise<System>;
    constructor(proxy: ProxyApp);
    getSystemInfoSync: () => {
        SDKVersion: string;
    };
}
