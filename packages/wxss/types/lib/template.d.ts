import postcss from 'postcss';
import * as Wx from '@catalyzed/asset';
export declare class WxssTemplateState {
    static create(): WxssTemplateState;
    _template: WxssTemplate | null;
    get template(): WxssTemplate;
    set template(template: WxssTemplate);
    get size(): number;
    get hasContent(): boolean;
    xcInvalid: string | null;
    chunks: Array<string | number[] | WxssTemplateState>;
    add(chunk: string | number[] | WxssTemplateState): void;
    clear(): void;
    clone(): WxssTemplateState;
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
    refs: WxssTemplateRef[];
    state: WxssTemplateState;
    /**
     * 加载
     * @param {AtRule} node
     * @returns {void}
     */
    import(node: postcss.AtRule): string | undefined;
}
export interface WxssTemplateOwner {
    findTemplateByPath: (filename: string) => WxssTemplate;
}
export declare function MixinWxssTemplate(PodContext: any): WxssTemplateOwner;
