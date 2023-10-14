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
    constructor(...rests: unknown[]);
    /**
     * 加入 Asset
     * @param {WxAsset} asset
     */
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
     * 加入 asset
     * @param {WxAsset} asset
     */
    put(asset: WxAsset): void;
}
export declare class WxAssetsBundle extends AssetsBundle {
    /**
     *
     * @param {AssetsBundleJSON} json
     * @returns {WxAssetsBundle}
     */
    static fromJSON(json: AssetsBundleJSON): WxAssetsBundle;
    protected _sets: WxAssetSets | null;
    get sets(): WxAssetSets;
    protected _app: WxAsset | null;
    get app(): WxAsset;
    protected _components: WxAssetSet[] | null;
    get components(): WxAssetSet[];
    protected _pages: WxAssetSet[] | null;
    get pages(): WxAssetSet[];
    get owner(): unknown;
    set owner(owner: unknown);
    /**
     * 从 JSON 加载 Assets
     * @param {AssetsBundleJSON} param
     */
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    /**
     *
     * @param {string} filename
     * @returns {WxAssetSet}
     */
    findSetByFilename(filename: string): WxAssetSet | null;
}
export interface ExtensionsFactory<T> {
    create(...rests: unknown[]): T;
    new (...rests: unknown[]): T;
    new (...rests: any[]): T;
}
export interface WxAssetsBundleOwner {
    root: string;
    bundle: WxAssetsBundle;
    assets: WxAsset[];
    components: WxAssetSet[];
    pages: WxAssetSet[];
    put(...rests: unknown[]): void;
    put(assets: WxAsset[]): void;
    mount(): Promise<void>;
    exists(filename: string): boolean;
    findByExt(ext: string): WxAsset[];
    findSetByFilename(filename: string): WxAssetSet | null;
    findByFilename(filename: string): WxAsset | null;
    replaceByFilename(filename: string, asset: WxAsset): void;
    toJSON(): {
        root: string;
        assets: AssetJSON[];
    };
}
export declare function MixinWxAssetsBundle<T>(Extension: ExtensionsFactory<T>): (abstract new (...rests: any[]) => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: WxAssetsBundle | null;
    bundle: WxAssetsBundle;
    readonly assets: WxAsset[];
    readonly components: WxAssetSet[];
    readonly pages: WxAssetSet[];
    put(...rests: unknown[]): void;
    mount(): Promise<undefined>;
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    findSetByFilename(filename: string): WxAssetSet | null;
    findByFilename(filename: string): WxAsset | null;
    replaceByFilename(filename: string, asset: WxAsset): void;
    exists(filename: string): boolean;
    findByExt(ext: string): WxAsset[];
    toJSON(): {
        root: string;
        assets: AssetJSON[];
    };
}) & {
    [x: string]: any;
    create(...rests: unknown[]): T & WxAssetsBundleOwner;
};
