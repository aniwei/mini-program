import postcss from 'postcss';
import { WxssTemplate, WxssTemplateState } from './template';
export declare enum WxssCompileContextKind {
    Root = "root",
    ArRule = "arrule"
}
export interface WxssCompileContext {
    kind: WxssCompileContextKind;
    name: string;
}
export declare class WxssCompile {
    /**
     * wxss 文件编译
     * @param {WxssTemplate} tpl
     * @returns {Promise<void>}
     */
    static compile(tpl: WxssTemplate): Promise<unknown>;
    compile(tpl: WxssTemplate): Promise<unknown>;
    process(node: postcss.Node, state: WxssTemplateState, context: WxssCompileContext): void;
}
