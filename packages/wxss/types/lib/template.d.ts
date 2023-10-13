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
    chunks: Array<string | number[] | WxssTemplateState>;
    push(chunk?: string | number[]): void;
    concat(chunk: string): void;
}
export type WxssTemplateRef = {
    path: string;
    index: number;
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
    index: number;
};
export declare class WxssTemplate extends Wx.WxAsset {
    get owner(): WxssTemplateOwner;
    set owner(owner: WxssTemplateOwner);
    get path(): string;
    get raws(): unknown;
    _state: WxssTemplateState | null;
    get state(): WxssTemplateState;
    set state(state: WxssTemplateState);
    refs: WxssTemplateRef[];
    constructor(...rests: unknown[]);
    /**
     * 加载
     * @param {AtRule} node
     * @returns {void}
     */
    import(node: postcss.AtRule): WxssTemplate | null;
}
export interface WxssTemplateOwner {
    findTemplateByPath: (filename: string) => WxssTemplate;
}
export declare function MixinWxssTemplate(PodContext: any): WxssTemplateOwner;
