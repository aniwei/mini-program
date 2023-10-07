import { ProxyApp } from '..';
import { WxCapability } from '../../capability';
export declare class Controller extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(proxy: ProxyApp): Promise<Controller>;
    constructor(proxy: ProxyApp);
    navigateTo: (data: {
        url: string;
    }) => any;
    navigateBack: (delta?: number) => any;
}
