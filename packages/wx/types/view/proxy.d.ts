import { NavigationProp } from '@react-navigation/native';
import { AssetsBundleJSON } from '@catalyzed/basic';
import { WxAssetSet } from '@catalyzed/asset';
export declare enum WxViewEventKind {
    GenerateFuncReady = "custom_event_GenerateFuncReady",
    PageEvent = "custom_event_PAGE_EVENT"
}
export declare enum WxViewInvocationKind {
    InsertTextArea = "insertTextArea"
}
export type NavigationEventSubscriber = () => void;
declare const ProxyView_base: (abstract new (...rests: any[]) => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: import("@catalyzed/asset").WxAssetsBundle | null;
    bundle: import("@catalyzed/asset").WxAssetsBundle;
    readonly assets: import("@catalyzed/asset").WxAsset[];
    readonly components: WxAssetSet[];
    readonly pages: WxAssetSet[];
    put(...rests: unknown[]): void;
    mount(): Promise<undefined>;
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    findSetByFilename(filename: string): WxAssetSet | null;
    findByFilename(filename: string): import("@catalyzed/asset").WxAsset | null;
    replaceByFilename(filename: string, asset: import("@catalyzed/asset").WxAsset): void;
    exists(filename: string): boolean;
    findByExt(ext: string): import("@catalyzed/asset").WxAsset[];
    toJSON(): {
        root: string;
        assets: import("@catalyzed/basic").AssetJSON[];
    };
}) & {
    [x: string]: any;
    create(...rests: unknown[]): import("@catalyzed/basic").Pod & import("@catalyzed/asset").WxAssetsBundleOwner;
};
export declare class ProxyView extends ProxyView_base {
    /**
     * 启动 View 渲染层
     * @param {string} root
     * @param {HTMLIFrameElement} iframe
     * @returns {ProxView}
     */
    static boot(root: string, iframe: HTMLIFrameElement): ProxyView;
    protected _navigation: NavigationProp<{}> | null;
    get navigation(): NavigationProp<{}>;
    set navigation(navigation: NavigationProp<{}>);
    protected _set: WxAssetSet | null;
    get set(): WxAssetSet | null;
    set set(set: WxAssetSet | null);
    protected _id: number | null;
    get id(): number;
    set id(id: number);
    protected _path: string | null;
    get path(): string;
    set path(path: string);
    get isActive(): number;
    get isInactive(): number;
    constructor();
    active: () => void;
    unactive: () => void;
    remove: () => void;
    fromAssetsBundle(assets: AssetsBundleJSON): Promise<undefined>;
    init(): Promise<any>;
}
export {};
