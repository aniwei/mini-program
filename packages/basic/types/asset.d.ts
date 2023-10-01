/// <reference types="node" />
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
export type AssetExt = '.xml' | '.scss' | '.css' | '.less' | '.json' | '.js' | '.ts' | '.png' | '.jpg' | '.jpeg' | string;
export type AssetJSON = {
    ext: string;
    root: string;
    source: ArrayBufferView | ArrayBufferLike | string;
    relative: string;
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
    type: AssetStoreKind;
    status: AssetStatusKind;
    root: string;
    parsed: ParsedPath;
    absolute: string;
    relative: string;
    /**
     * 构造函数
     * @param {string} file
     * @param {string} root
     */
    constructor(relative: string, root: string, source?: Buffer | string);
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
    findByFilename(relative: string): Asset | null;
    /**
     * 序列化
     */
    toJSON(): {
        root: string;
        assets: Asset[];
    };
}
