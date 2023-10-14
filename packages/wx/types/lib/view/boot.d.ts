import { AssetsBundleJSON } from '@catalyzed/basic';
import { WxAsset } from '@catalyzed/asset';
import { WxViewLibs } from './libs';
import '../asset';
declare const WxView_base: (abstract new (...rests: any[]) => {
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
    create(...rests: unknown[]): WxViewLibs & import("@catalyzed/asset").WxAssetsBundleOwner;
};
export declare class WxView extends WxView_base {
    static create(...rests: unknown[]): WxViewLibs & import("@catalyzed/asset").WxAssetsBundleOwner;
    constructor();
    handleSubscribe(...rest: unknown[]): void;
    invokeHandler(name: string, data: string, id: string): any;
    publishHandler(name: string, data: string, id: string): void;
    inject(...rests: unknown[]): void;
    startup(): void;
    fromAssetsBundle(assets: AssetsBundleJSON): Promise<undefined>;
}
export {};
