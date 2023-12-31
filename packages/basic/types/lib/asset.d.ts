export interface AssetHash {
    hash: string;
    ext: string;
    root: string;
    relative: string;
}
export declare enum AssetStoreKind {
    Memory = 0,
    Locale = 1
}
export type ParsedPath = {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
};
export type AssetExt = '.xml' | '.scss' | '.css' | '.less' | '.json' | '.js' | '.ts' | '.png' | '.jpg' | '.jpeg' | '.svg' | string;
export type AssetJSON = {
    ext: string;
    root: string;
    hash: string | null;
    source: ArrayBufferView | ArrayBufferLike | string;
    relative: string;
    sourceMap: boolean | null;
};
export declare enum AssetStatusKind {
    Created = 0,
    Unmount = 1,
    Mounted = 2
}
export declare abstract class Asset {
    static fromJSON(...rests: unknown[]): void;
    get ext(): string;
    get name(): string;
    get mounted(): boolean;
    _data: JSON | string | unknown | null;
    get data(): JSON | string | unknown;
    set data(data: JSON | string | unknown);
    _source: ArrayBufferLike | ArrayBufferView | string | null;
    get source(): ArrayBufferLike | ArrayBufferView | string | null;
    set source(source: ArrayBufferLike | ArrayBufferView | string | null);
    _relative: string | null;
    get relative(): string;
    set relative(relative: string);
    type: AssetStoreKind;
    status: AssetStatusKind;
    root: string;
    parsed: ParsedPath;
    absolute: string;
    hash: string | null;
    sourceMap: boolean;
    abstract owner: unknown;
    constructor(...rests: unknown[]);
    mount(): Promise<void> | undefined;
    toJSON(): AssetJSON;
}
export interface AssetProcessFactory<T> {
    create(...rests: unknown[]): T;
    create(ext: string): T;
    new (...rests: unknown[]): T;
    new (ext: string): T;
}
export declare class AssetProcess {
    static create<T extends AssetProcess>(...rests: unknown[]): T;
    exts: string[];
    exclude: (string | RegExp)[];
    constructor(exts: string[] | string, exclude?: (string | RegExp)[]);
    decode(data: unknown): Promise<void>;
}
export declare class AssetProcesses {
    static create(): AssetProcesses;
    exts: Map<AssetExt, AssetProcess>;
    constructor();
    register(processor: AssetProcess): void;
    /**
     *
     * @param {Asset} asset
     * @returns {boolean}
     */
    exclude(asset: Asset): boolean;
    /**
     * 数据转换
     * @param {Asset} asset
     * @returns {JSON | string}
     */
    decode(asset: Asset): Promise<void> | undefined;
}
export type AssetsBundleJSON = {
    root: string;
    assets: AssetJSON[];
};
export declare abstract class AssetsBundle {
    static processor: AssetProcesses;
    static decode(asset: Asset): Promise<void> | undefined;
    static fromJSON(bundle: AssetsBundleJSON): void;
    protected _owner: unknown | null;
    get owner(): unknown;
    set owner(owner: unknown);
    root: string;
    assets: Asset[];
    /**
     * 构造函数
     * @param {string} relative
     * @param {string} root
     */
    constructor(root: string);
    put(assets: Asset[] | Asset): void;
    mount(): Promise<undefined>;
    exists(filename: string): boolean;
    findByExt(ext: AssetExt): Asset[];
    /**
     * 根据相对路径查找
     * @param relative
     * @returns
     */
    findByFilename(relative: string): Asset | null;
    /**
     * 替换
     * @param {string} relative
     * @param {Asset} asset
     */
    replaceByFilename(relative: string, asset: Asset): void;
    /**
     * 序列化
     */
    toJSON(): {
        root: string;
        assets: AssetJSON[];
    };
}
