import { AssetsBundleJSON } from '@catalyze/basic';
import { NavigationContainerRef } from '@react-navigation/native';
import { WxAsset } from '@catalyze/asset';
import { WxSettings } from '../context';
import { ProxyView } from '../view';
import { Controller } from './capability/proxy/controller';
import { UI } from './capability/proxy/ui';
import { Request } from './capability/proxy/request';
import '../asset';
export interface WxAppRouteOptions {
    path: string;
    query?: object;
    scene?: number;
    notFound?: boolean;
    renderer?: 'webview';
    openType?: 'appLaunch' | 'navigateTo' | 'navigate';
}
export interface ProxyApp {
    controller: Controller;
    request: Request;
    ui: UI;
}
declare const ProxyApp_base: (abstract new () => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: import("@catalyze/asset").WxAssetsBundle | null;
    bundle: import("@catalyze/asset").WxAssetsBundle;
    readonly assets: import("@catalyze/basic").Asset[];
    readonly components: import("@catalyze/asset").WxAssetSet[];
    readonly pages: import("@catalyze/asset").WxAssetSet[];
    put(assets: WxAsset[]): void;
    mount(): Promise<undefined>;
    fromAssetsBundleJSON({ root, assets }: AssetsBundleJSON): void;
    findSetByFilename(filename: string): import("@catalyze/asset").WxAssetSet | null;
    findByFilename(filename: string): import("@catalyze/basic").Asset | null;
    exists(filename: string): boolean;
    findByExt(ext: string): import("@catalyze/basic").Asset[];
    toJSON(): {
        root: string;
        assets: import("@catalyze/basic").Asset[];
    };
}) & {
    [x: string]: any;
    create(...rests: unknown[]): any;
};
/**
 * View 创建及持有类
 */
export declare abstract class ProxyApp extends ProxyApp_base {
    static proxyId: number;
    static boot(...rests: unknown[]): any;
    protected _navigation: NavigationContainerRef<{}> | null;
    get navigation(): NavigationContainerRef<{}>;
    set navigation(navigation: NavigationContainerRef<{}>);
    get settings(): WxSettings;
    set settings(settings: WxSettings);
    get booted(): number;
    views: ProxyView[];
    /**
     * 初始化
     * @param {AssetsBundleJSON} assets
     * @param {WxSettings} settings
     * @returns {Promise<void>}
     */
    init(assets: AssetsBundleJSON, settings: WxSettings): Promise<any>;
    /**
     *
     * @param assets
     * @param settings
     * @returns
     */
    fromAssetsBundleAndSettings(assets: AssetsBundleJSON, settings: WxSettings): Promise<void>;
    /**
     *
     * @param delta
     */
    navigateBack(delta: number): void;
    /**
     *
     * @param delta
     */
    navigateTo(options?: object): void;
    routing(container: HTMLIFrameElement, options: WxAppRouteOptions): Promise<ProxyView>;
    handlePublish(name: string, data: unknown, ids: unknown[]): void;
    handleInvoke(name: string, data: unknown, id: string): any;
    /**
     * 创建 View
     * @param path
     * @param container
     * @returns
     */
    create(path: string, container: HTMLIFrameElement): ProxyView;
}
export {};
