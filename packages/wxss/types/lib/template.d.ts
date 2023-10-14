import postcss from 'postcss';
import * as Wx from '@catalyzed/asset';
export declare class WxssTemplateState {
    static create(): WxssTemplateState;
    _template: WxssTemplate | null;
    get template(): WxssTemplate;
    set template(template: WxssTemplate);
    get size(): number;
    get hasContent(): boolean;
    current: string;
    xcInvalid: string | null;
    chunks: Array<string | Array<number | string> | WxssTemplateState>;
    /**
     * 结束
     * @param {string | number[] | undefined} chunk
     */
    end(chunk?: string | Array<string | number>): void;
    /**
     * 收集
     * @param {string} chunk
     */
    concat(chunk: string): void;
}
export type WxssTemplateRef = {
    path: string;
    import: {
        start: {
            column: number;
            line: number;
        };
        end: {
            column: number;
            line: number;
        };
        raws: string;
    };
};
export type WxssTemplateRefed = {
    path: string;
};
export declare enum WxssTemplateModelKind {
    Pixel = 0,
    Suffix = 1,
    Assemble = 2
}
export declare class WxssTemplate extends Wx.WxAsset {
    get owner(): WxssTemplateOwner;
    set owner(owner: WxssTemplateOwner);
    get path(): string;
    get raws(): unknown;
    _state: WxssTemplateState | null;
    get state(): WxssTemplateState;
    set state(state: WxssTemplateState);
    independent: boolean;
    refs: WxssTemplateRef[];
    refeds: WxssTemplateRefed[];
    constructor(...rests: unknown[]);
    /**
     * 引用绑定
     * @param {AtRule} node
     * @returns {void}
     */
    import(node: postcss.AtRule): WxssTemplate | null;
}
export declare class WxssTemplateStyleOwner extends Map<string, WxssTemplateAssembler> {
    static BASE_DEVICE_WIDTH: number;
    static EPS: number;
    static _SETTINGS: WxssTemplateOwnerSettings | null;
    static get SETTINGS(): WxssTemplateOwnerSettings;
    static create(owner: WxssTemplateOwner, suffix: string): WxssTemplateStyleOwner;
    get settings(): WxssTemplateOwnerSettings;
    suffix: string;
    owner: WxssTemplateOwner;
    /**
     *
     * @param {WxssTemplateOwner} owner
     * @param {string} suffix
     */
    constructor(owner: WxssTemplateOwner, suffix?: string);
    /**
     *
     * @param {string} path
     * @returns {WxssTemplate}
     */
    findTemplateByPath(path: string): WxssTemplate;
    /**
     *
     * @param {WxssTemplate} template
     * @returns {WxssTemplateAssembler}
     */
    findAssemblerByTemplate(template: WxssTemplate): WxssTemplateAssembler;
    /**
     * 重新计算
     * @param {number} width
     */
    recalculate(width: number): void;
    /**
     * 渲染样式
     * @param {WxssTemplate} template
     */
    css(template: WxssTemplate): void;
}
export type WxssRecalculatorHandle = (width: number) => void;
export declare class WxssTemplateAssembler {
    static create(owner: WxssTemplateStyleOwner, template: WxssTemplate, suffix?: string): WxssTemplateAssembler;
    get path(): string;
    get state(): WxssTemplateState;
    get independent(): boolean;
    _style: HTMLStyleElement | null;
    get style(): HTMLStyleElement;
    width: number;
    template: WxssTemplate;
    owner: WxssTemplateStyleOwner;
    suffix: string;
    refs: string[];
    /**
     *
     * @param {WxssTemplateStyleOwner} owner
     * @param {WxssTemplate} template
     */
    constructor(owner: WxssTemplateStyleOwner, template: WxssTemplate, suffix?: string);
    /**
     * 组装数据
     * @returns
     */
    assemble(): string;
    recalculate(width: number): void;
    rewrite(): void;
    write(): void;
    /**
     * rpx 转换
     * @param {number} rpx
     * @param {number} width
     * @returns {number}
     */
    rpx(rpx: number, width: number): number;
}
export interface WxssTemplateOwnerSettings {
    platform: string;
    width: number;
    height: number;
    devicePixelRatio: number;
}
export interface MixinWxssTemplateFactory<T> extends Wx.ExtensionsFactory<T> {
    new (...rests: unknown[]): T;
    create(...rests: unknown[]): T;
}
export interface WxssTemplateOwner extends Wx.WxAssetsBundleOwner {
    findTemplateByPath: (filename: string) => WxssTemplate;
    process: () => void;
    css: (filename: string) => void;
}
export declare function MixinWxssTemplate<T>(BaseBundle: MixinWxssTemplateFactory<WxssTemplateOwner>): WxssTemplateOwner;
