/// <reference types="node" />
import { Asset, AssetHash, AssetJSON, AssetsBundle, AssetsBundleJSON } from '@catalyzed/basic';
import { WxAppUsingJSON, WxAppWindowJSON } from '@catalyzed/types';
export interface WxAssetHash extends AssetHash {
    hash: string;
    relative: string;
}
export interface WxAssetSetJSON extends WxAppWindowJSON {
    component?: boolean;
    usingComponents?: WxAppUsingJSON;
}
export interface WxAssetProjJSON {
    appid: string;
}
export interface WxAssetFactory<T> {
    create<T>(filename: string, root: string, source?: Buffer | string): T;
    new (filename: string, root: string, source?: Buffer | string): T;
}
export declare class WxAsset extends Asset {
    static create<T extends WxAsset>(filename: string, root: string, source?: ArrayBufferLike | ArrayBufferView | string): T;
    static fromJSON(json: AssetJSON): WxAsset;
    _owner: WxAssetsBundleOwner | null;
    get owner(): WxAssetsBundleOwner | null;
    set owner(owner: WxAssetsBundleOwner | null);
}
export declare enum WxAssetSetKind {
    Component = 0,
    Page = 1,
    Unknown = 2
}
export declare class WxAssetSet extends AssetsBundle {
    /**
     * 创建 资源组
     * @param {string} relative
     * @param {string} root
     * @returns {WxAssetSet}
     */
    static create(app: WxAsset, relative: string, root: string): WxAssetSet;
    protected _window: WxAppWindowJSON | null;
    get window(): WxAppWindowJSON | null;
    protected _usingComponents: WxAppUsingJSON | null;
    get usingComponents(): WxAppUsingJSON | null;
    get wxml(): WxAsset;
    get wxss(): WxAsset;
    get js(): WxAsset;
    get ts(): WxAsset;
    get json(): WxAsset;
    get type(): WxAssetSetKind;
    app: WxAsset;
    relative: string;
    constructor(app: WxAsset, relative: string, root: string);
    put(asset: WxAsset): void;
}
export declare class WxAssetSets {
    static create(app: WxAsset, root: string): WxAssetSets;
    get pages(): WxAssetSet[];
    get components(): WxAssetSet[];
    app: WxAsset;
    root: string;
    sets: Map<string, WxAssetSet>;
    constructor(app: WxAsset, root: string);
    /**
     * 根据文件路径获取 WxAsset
     * @param {string} filename
     * @returns {WxAssetSet | null}
     */
    findByFilename(relative: string): WxAssetSet | null;
    /**
     * 根据 WxAsset 获取
     * @param {WxAsset}
     * @returns {WxAssetSet | null}
     */
    findByAsset(asset: WxAsset): WxAssetSet | null;
    /**
     *
     * @param {WxAsset} asset
     */
    put(asset: WxAsset): void;
}
export declare class WxAssetsBundle extends AssetsBundle {
    static fromJSON(json: AssetsBundleJSON): WxAssetsBundle;
    protected _sets: WxAssetSets | null;
    get sets(): WxAssetSets;
    protected _app: WxAsset | null;
    get app(): WxAsset;
    protected _components: WxAssetSet[] | null;
    get components(): WxAssetSet[];
    protected _pages: WxAssetSet[] | null;
    get pages(): WxAssetSet[];
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    findSetByFilename(filename: string): WxAssetSet | null;
}
export interface WxAssetsBundleOwnerFactory {
    create(...rests: unknown[]): unknown;
    new (...rests: unknown[]): unknown;
    put(assets: WxAsset[]): void;
    findByFilename(filename: string): WxAsset;
}
export interface WxAssetsBundleOwner {
}
export declare function MixinWxAssetsBundle(PodContext: any): (abstract new () => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: WxAssetsBundle | null;
    bundle: WxAssetsBundle;
    readonly assets: Asset[];
    readonly components: WxAssetSet[];
    readonly pages: WxAssetSet[];
    put(assets: WxAsset[]): void;
    mount(): Promise<undefined>;
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    findSetByFilename(filename: string): WxAssetSet | null;
    findByFilename(filename: string): Asset | null;
    replaceByFilename(filename: string, asset: WxAsset): void;
    exists(filename: string): boolean;
    findByExt(ext: string): Asset[];
    toJSON(): {
        root: string;
        assets: AssetJSON[];
    };
}) & {
    [x: string]: any;
    create(...rests: unknown[]): any;
};
