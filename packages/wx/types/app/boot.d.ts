import { AssetsBundleJSON } from '@catalyzed/basic';
import { WxAsset } from '@catalyzed/asset';
import { WxSettings } from '../context';
import '../asset';
interface WxAppInit extends AssetsBundleJSON {
    root: string;
}
declare const WxApp_base: (abstract new (...rests: any[]) => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: import("@catalyzed/asset").WxAssetsBundle | null;
    bundle: import("@catalyzed/asset").WxAssetsBundle;
    readonly assets: WxAsset[];
    readonly components: import("@catalyzed/asset").WxAssetSet[];
    readonly pages: import("@catalyzed/asset").WxAssetSet[];
    put(...rests: unknown[]): void;
    mount(): Promise<undefined>;
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    findSetByFilename(filename: string): import("@catalyzed/asset").WxAssetSet | null;
    findByFilename(filename: string): WxAsset | null;
    replaceByFilename(filename: string, asset: WxAsset): void;
    exists(filename: string): boolean;
    findByExt(ext: string): WxAsset[];
    toJSON(): {
        root: string;
        assets: import("@catalyzed/basic").AssetJSON[];
    };
}) & {
    [x: string]: any;
    create(...rests: unknown[]): import("@catalyzed/basic").Pod & import("@catalyzed/asset").WxAssetsBundleOwner;
};
export declare class WxApp extends WxApp_base {
    static create(...rests: unknown[]): import("@catalyzed/basic").Pod & import("@catalyzed/asset").WxAssetsBundleOwner;
    constructor();
    inject(name: string, code: string): void;
    startup(): Promise<void>;
    fromAssetsBundleAndSettings(data: WxAppInit, settings: WxSettings): Promise<void>;
    handleSubscribe(...rest: unknown[]): void;
    invokeHandler(name: string, data: string, id: string): any;
    publishHandler(name: string, data: string, id: string): void;
}
export {};
