import * as Wx from '@catalyzed/asset';
import { MainCompilePodOwner } from './pod/proxy';
declare const WxAssetsBundle_base: (abstract new (...rests: any[]) => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: Wx.WxAssetsBundle | null;
    bundle: Wx.WxAssetsBundle;
    readonly assets: Wx.WxAsset[];
    readonly components: Wx.WxAssetSet[];
    readonly pages: Wx.WxAssetSet[];
    put(...rests: unknown[]): void;
    mount(): Promise<undefined>;
    fromAssetsBundleJSON({ root, assets }: import("@catalyzed/basic").AssetsBundleJSON): void;
    findSetByFilename(filename: string): Wx.WxAssetSet | null;
    findByFilename(filename: string): Wx.WxAsset | null;
    replaceByFilename(filename: string, asset: Wx.WxAsset): void;
    exists(filename: string): boolean;
    findByExt(ext: string): Wx.WxAsset[];
    toJSON(): {
        root: string;
        assets: import("@catalyzed/basic").AssetJSON[];
    };
}) & {
    [x: string]: any;
    create(...rests: unknown[]): MainCompilePodOwner & Wx.WxAssetsBundleOwner;
};
export declare class WxAssetsBundle extends WxAssetsBundle_base {
    /**
     * 根据文件后缀名搜索文件
     * @param {string} root
     * @param {string[]} exts
     * @returns {Promise<string[]>}
     */
    static searchByExts(root: string, exts: string[]): Promise<string[]>;
    protected _xmlsExecArgs: Array<string | number> | null;
    get xmlsExecArgs(): Array<string | number> | null;
    set xmlsExecArgs(xmlsExecArgs: Array<string | number> | null);
    protected _cssesExecArgs: Array<string | number> | null;
    get cssesExecArgs(): Array<string | number> | null;
    set cssesExecArgs(cssesExecArgs: Array<string | number> | null);
    put(assets: Wx.WxAsset): void;
    put(assets: Wx.WxAsset[]): void;
    search(): Promise<undefined>;
}
export {};
