import { ProxyView } from '../../proxy';
import { WxCapability } from '../../../capability';
export declare class Utililty extends WxCapability<ProxyView> {
    static kSymbol: symbol;
    static create(proxy: ProxyView): Promise<Utililty>;
    constructor(proxy: ProxyView);
    getLocalImgData: (data: {
        path: string;
    }) => {
        localData: string;
    } | undefined;
    getCurrentRoute: () => {
        route: string;
    };
}
