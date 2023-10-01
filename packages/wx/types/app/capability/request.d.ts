import { ProxyApp } from '..';
import { WxCapability } from '../../capability';
export declare class Request extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(proxy: ProxyApp): Promise<Request>;
    constructor(proxy: ProxyApp);
    createRequestTask: (data: unknown) => any;
}
