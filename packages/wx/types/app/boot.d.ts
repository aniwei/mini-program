import { Asset, AssetsBundleJSON } from '@catalyze/basic';
import { WxAsset, WxAssetsBundle } from '@catalyze/asset';
import { WxSettings } from '../context';
import '../asset';
declare const WxApp_base: (abstract new () => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: WxAssetsBundle | null;
    bundle: WxAssetsBundle;
    readonly assets: Asset[];
    readonly components: import("@catalyze/asset").WxAssetSet[];
    readonly pages: import("@catalyze/asset").WxAssetSet[];
    put(assets: WxAsset[]): void;
    mount(): Promise<undefined>;
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    findSetByFilename(filename: string): import("@catalyze/asset").WxAssetSet | null;
    findByFilename(filename: string): Asset | null;
    exists(filename: string): boolean;
    findByExt(ext: string): Asset[];
    toJSON(): {
        root: string;
        assets: Asset[];
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
    fromAssetsBundleAndSettings(assets: AssetsBundleJSON, settings: WxSettings): Promise<void>;
    handleSubscribe(...rest: unknown[]): void;
    invokeHandler(name: string, data: string, id: string): any;
    publishHandler(name: string, data: string, id: string): void;
}
export {};
