/// <reference types="node" />
import postcss from 'postcss';
import PostcssSelector from 'postcss-selector-parser';
import PostcssValue from 'postcss-value-parser';
import type { WxssCompileContext } from './compile';
import type { WxssTemplateState } from './template';
export declare abstract class WxssTransform {
    static process(...rests: unknown[]): NodeJS.Process;
    constructor(...rests: unknown[]);
    abstract walk(node: unknown, state: WxssTemplateState, ...rests: unknown[]): void;
    abstract process(...rests: unknown[]): void;
    abstract process(node: postcss.Node, state: WxssTemplateState, ...rests: unknown[]): void;
}
export type SelectorTransformState = {
    rule: postcss.Rule;
    origin: boolean;
    xcInvalid: string | null;
};
export declare class WxssSelectorTransform extends WxssTransform {
    /**
     *
     * @param {PostcssSelector.Node} node
     * @param {WxssTemplateState} state
     * @param {SelectorTransformState} selectorState
     * @param {WxssCompileContext} context
     */
    walk(node: PostcssSelector.Node, state: WxssTemplateState, selectorState: SelectorTransformState, context: WxssCompileContext): void;
    /**
     *
     * @param {postcss.Rule} node
     * @param {WxssTemplateState} state
     * @param {WxssCompileContext} context
     * @returns {Promise}
     */
    process(node: postcss.Rule, state: WxssTemplateState, context: WxssCompileContext): void;
}
export type DeclarationTransformState = {
    declaration: postcss.Declaration;
    declaratedResponsivePixel: boolean;
    savedResponsivePixel: boolean;
};
export declare class WxssDeclarationTransform extends WxssTransform {
    /**
     *
     * @param {PostcssValue.Node} node
     * @param {WxssTemplateState} state
     * @param {DeclarationTransformState} declarationState
     * @param {WxssCompileContext} context
     */
    walk(node: PostcssValue.Node, state: WxssTemplateState, declarationState: DeclarationTransformState, context: WxssCompileContext): void;
    /**
     *
     * @param {postcss.Declaration} node
     * @param {WxssTemplateState} state
     * @returns {void}
     */
    process(node: postcss.Declaration, state: WxssTemplateState, context: WxssCompileContext): DeclarationTransformState;
}
