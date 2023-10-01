import { EventEmitter } from '@catalyze/basic';
import { ProxyView } from '../../proxy';
export interface PlaceholderStyle {
    fontSize: number;
    fontWeight: string;
    color: string;
}
export interface ShowKeyboardInputFields {
    bindinput: string;
    bindkeyboardheightchange: string;
    target: {
        id: string;
        dataset: {
            [key: string]: string;
        };
        offsetTop: number;
        offsetLeft: number;
    };
    setKeyboardValue: boolean;
    securityType: 'textarea';
    currentTarget: {
        id: string;
        dataset: {
            [key: string]: string;
        };
        offsetTop: number;
        offsetLeft: number;
    };
    nodeId: string;
}
export interface ShowKeyboardPayload {
    type: string;
    maxLength: number;
    style: {
        width: number;
        height: number;
        left: number;
        top: number;
        fontFamily: string;
        fontSize: number;
        fontWeight: string;
        color: string;
        backgroundColor: string;
        marginBottom: number;
        textAlign: string;
    };
    data: string;
    placeholderStyle: PlaceholderStyle;
    placeholderStyleDark: PlaceholderStyle;
    keyboardAppearance: string;
    confirmHold: boolean;
    confirmType: string;
    adjustPosition: boolean;
    showCoverView: boolean;
    defaultValue: string;
    viewId: number;
    cursor: number;
    inputId: number;
}
interface TextViewElement extends HTMLElement {
    value: string;
    placeholder?: string | null;
    selectionStart: number | null;
    selectionEnd: number | null;
    selectionDirection: string | null;
}
export declare abstract class TextView<T extends TextViewElement> extends EventEmitter<'input'> {
    protected _element: T | null;
    get element(): T;
    set element(element: T);
    protected _width: number;
    get width(): number;
    set width(width: number);
    protected _height: number;
    get height(): number;
    set height(height: number);
    protected _top: number;
    get top(): number;
    set top(top: number);
    protected _left: number;
    get left(): number;
    set left(left: number);
    protected _fontSize: number;
    get fontSize(): number;
    set fontSize(fontSize: number);
    protected _fontFamily: string;
    get fontFamily(): string;
    set fontFamily(fontFamily: string);
    protected _color: string;
    get color(): string;
    set color(color: string);
    protected _textAlign: string;
    get textAlign(): string;
    set textAlign(textAlign: string);
    protected _placeholder: string;
    get placeholder(): string;
    set placeholder(placeholder: string);
    protected _value: string;
    get value(): string;
    set value(value: string);
    protected _data: ShowKeyboardInputFields | null;
    get data(): ShowKeyboardInputFields;
    set data(data: ShowKeyboardInputFields);
    protected _id: number | null;
    get id(): number;
    set id(id: number);
    protected proxy: ProxyView;
    constructor(proxy: ProxyView);
    abstract createElement(): T;
    private handleInput;
    private handleBlur;
    dispatch<T extends object>(type: 'setKeyboardValue' | 'onKeyboardConfirm' | 'onKeyboardComplete' | 'onKeyboardShow', detail?: T): void;
    append(): void;
    remove(): void;
    focus(): void;
}
export declare class InputView extends TextView<HTMLInputElement> {
    createElement(): HTMLInputElement;
}
export declare class TextAreaView extends TextView<HTMLTextAreaElement> {
    createElement(): HTMLTextAreaElement;
}
export {};
