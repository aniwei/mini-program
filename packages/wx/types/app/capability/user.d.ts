import { WxCapability } from '../../capability';
import { ProxyApp } from '..';
export declare class User extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(proxy: ProxyApp): Promise<User>;
    constructor(proxy: ProxyApp);
    login: () => void;
    getPhoneNumber: () => void;
    getUserInfo: () => void;
}
