import { AssetsBundleJSON } from '@catalyzed/basic';
import { NavigationContainerRef } from '@react-navigation/native';
import { WxAsset } from '@catalyzed/asset';
import { WxSettings } from '../context';
import { ProxyView } from '../view';
import { Controller } from './capability/proxy/controller';
import { UI } from './capability/proxy/ui';
import { Request } from './capability/proxy/request';
import '../asset';
import type { WxProj } from '@catalyzed/types';
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
export interface ProxyAppInit extends AssetsBundleJSON {
    proj: WxProj;
}
declare const ProxyApp_base: (abstract new () => {
    [x: string]: any;
    _root: string | null;
    root: string;
    _bundle: import("@catalyzed/asset").WxAssetsBundle | null;
    bundle: import("@catalyzed/asset").WxAssetsBundle;
    readonly assets: import("@catalyzed/basic").Asset[];
    readonly components: import("@catalyzed/asset").WxAssetSet[];
    readonly pages: import("@catalyzed/asset").WxAssetSet[];
    put(...rests: unknown[]): void;
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
/**
 * View 创建及持有类
 */
export declare abstract class ProxyApp extends ProxyApp_base {
    static proxyId: number;
    static boot(...rests: unknown[]): ProxyApp;
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
    init(data: ProxyAppInit, settings: WxSettings): Promise<any>;
    /**
     *
     * @param assets
     * @param settings
     * @returns
     */
    fromAssetsBundleAndSettings(data: ProxyAppInit, settings: WxSettings): Promise<void>;
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
