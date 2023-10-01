import { NavigationContainerRef } from '@react-navigation/native';
import { ProxyApp } from '../..';
import { WxCapability } from '../../../capability';
export declare class UI extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(proxy: ProxyApp): Promise<UI>;
    protected _navigation: NavigationContainerRef<{}> | null;
    get navigation(): NavigationContainerRef<{}>;
    set navigation(navigation: NavigationContainerRef<{}>);
    constructor(proxy: ProxyApp);
    showToast: (data: unknown) => Promise<void>;
    showNavigationBarLoading: (options: unknown) => void;
    setNavigationBarTitle: ({ title }: {
        title: string;
    }) => Promise<void>;
    setNavigationBarColor: () => void;
}
