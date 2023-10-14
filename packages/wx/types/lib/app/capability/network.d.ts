import { ProxyApp } from '..';
import { WxCapability } from '../../capability';
export declare class Network extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(delegate: ProxyApp): Promise<Network>;
    constructor(proxy: ProxyApp);
    getNetworkType: () => Promise<{
        networkType: string;
    }>;
}
