import { ProxyApp } from '..';
import { WxCapability } from '../../capability';
export declare class UI extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(proxy: ProxyApp, ...rests: unknown[]): Promise<UI>;
    constructor(proxy: ProxyApp);
    showNavigationBarLoading: (options: unknown) => any;
    setNavigationBarTitle: (options: unknown) => any;
    setNavigationBarColor: (options: unknown) => any;
    showToast: (options: unknown) => any;
}
