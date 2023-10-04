import { AssetsBundleJSON } from '@catalyze/basic';
import { WxAsset } from '@catalyze/asset';
import { WxSettings } from '../context';
import '../asset';
interface WxAppInit extends AssetsBundleJSON {
    root: string;
}
declare const WxApp_base: (abstract new () => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: import("@catalyze/asset").WxAssetsBundle | null;
    bundle: import("@catalyze/asset").WxAssetsBundle;
    readonly assets: import("@catalyze/basic").Asset[];
    readonly components: import("@catalyze/asset").WxAssetSet[];
    readonly pages: import("@catalyze/asset").WxAssetSet[];
    put(assets: WxAsset[]): void;
    mount(): Promise<undefined>;
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    findSetByFilename(filename: string): import("@catalyze/asset").WxAssetSet | null;
    findByFilename(filename: string): import("@catalyze/basic").Asset | null;
    exists(filename: string): boolean;
    findByExt(ext: string): import("@catalyze/basic").Asset[];
    toJSON(): {
        root: string;
        assets: import("@catalyze/basic").Asset[];
    };
}) & {
    [x: string]: any;
    create(...rests: unknown[]): any;
};
export declare class WxApp extends WxApp_base {
    static create(...rests: unknown[]): any;
    constructor();
    inject(name: string, code: string): void;
    startup(): Promise<void>;
    fromAssetsBundleAndSettings(data: WxAppInit, settings: WxSettings): Promise<void>;
    handleSubscribe(...rest: unknown[]): void;
    invokeHandler(name: string, data: string, id: string): any;
    publishHandler(name: string, data: string, id: string): void;
}
export {};
