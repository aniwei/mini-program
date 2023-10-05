import { AssetsBundleJSON } from '@catalyzed/basic';
import { WxAsset } from '@catalyzed/asset';
import { WxSettings } from '../context';
import '../asset';
interface WxAppInit extends AssetsBundleJSON {
    root: string;
}
declare const WxApp_base: (abstract new () => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: import("@catalyzed/asset").WxAssetsBundle | null;
    bundle: import("@catalyzed/asset").WxAssetsBundle;
    readonly assets: import("@catalyzed/basic").Asset[];
    readonly components: import("@catalyzed/asset").WxAssetSet[];
    readonly pages: import("@catalyzed/asset").WxAssetSet[];
    put(assets: WxAsset[]): void;
    mount(): Promise<undefined>;
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    findSetByFilename(filename: string): import("@catalyzed/asset").WxAssetSet | null;
    findByFilename(filename: string): import("@catalyzed/basic").Asset | null;
    replaceByFilename(filename: string, asset: WxAsset): void;
    exists(filename: string): boolean;
    findByExt(ext: string): import("@catalyzed/basic").Asset[];
    toJSON(): {
        root: string;
        assets: import("@catalyzed/basic").AssetJSON[];
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
