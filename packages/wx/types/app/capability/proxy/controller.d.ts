import { WxCapability } from '../../../capability';
import { ProxyApp } from '../..';
export declare class Controller extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(proxy: ProxyApp): Promise<Controller>;
    constructor(proxy: ProxyApp);
    navigateTo: (data: {
        url: string;
    }) => Promise<void>;
    navigateBack: (delta?: number) => Promise<void>;
}
