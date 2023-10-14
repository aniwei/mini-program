import { ProxyApp } from '..';
import { WxCapability } from '../../capability';
export declare class Storage extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(proxy: ProxyApp): Promise<Storage>;
    constructor(proxy: ProxyApp);
    setStorage: (key: string, value: unknown) => void;
    getStorage: (key: string) => any;
}
