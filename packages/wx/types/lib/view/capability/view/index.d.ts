import { ProxyView } from '../../proxy';
import { WxCapability } from '../../../capability';
import { InputView, ShowKeyboardPayload, TextAreaView } from './text-view';
export declare class View extends WxCapability<ProxyView> {
    static kSymbol: symbol;
    static create(proxy: ProxyView): Promise<View>;
    input: InputView;
    textarea: TextAreaView;
    constructor(proxy: ProxyView);
    hideKeyboard: () => void;
    showKeyboard: (payload: ShowKeyboardPayload) => {
        errMsg: string;
        inputId: number;
    };
    insertTextArea: (payload: ShowKeyboardPayload) => {
        errMsg: string;
    };
}
