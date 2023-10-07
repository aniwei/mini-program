import { ProxyApp } from '../..';
import { WxCapability } from '../../../capability';
export interface TextInputPlaceholderStyle {
    fontSize: number;
    fontWeight: string;
    color: string;
}
export interface TextInputPayload {
    adjustKeyboardTo: string;
    adjustPosition: boolean;
    autoSize: boolean;
    confirm: boolean;
    confirmHold: boolean;
    confirmType: string;
    data: string;
    disableContainerInset: boolean;
    disabled: boolean;
    fixed: boolean;
    hidden: boolean;
    inputId: number;
    keyboardAppearance: string;
    maxLength: number;
    parentId: number;
    placeholder: string;
    placeholderStyle: TextInputPlaceholderStyle;
    placeholderStyleDark: TextInputPlaceholderStyle;
    showCoverView: boolean;
    style: {
        width: number;
        left: number;
        minHeight: number;
        maxHeight: number;
        top: number;
        height: number;
    };
    value: string;
    zIndex: number;
}
export declare class View extends WxCapability<ProxyApp> {
    static kSymbol: symbol;
    static create(proxy: ProxyApp): Promise<View>;
    constructor(proxy: ProxyApp);
    insertTextArea: (payload: TextInputPayload, id: string) => void;
}
