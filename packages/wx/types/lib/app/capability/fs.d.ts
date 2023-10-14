import { FSModule } from 'browserfs/dist/node/core/FS';
import { WxCapability } from '../../capability';
import { ProxyApp } from '..';
export interface FSCreateOptions {
    [key: string]: {
        fs: string;
        options: {
            [key: string]: unknown;
        };
    };
}
export declare class FS extends WxCapability<ProxyApp> {
    static create(proxy: ProxyApp, options: FSCreateOptions): Promise<FS>;
    static kSymbol: symbol;
    protected module: FSModule;
    constructor(proxy: ProxyApp, module: FSModule);
    readFile: () => void;
    writeFile: () => void;
    mkdir: () => void;
}
