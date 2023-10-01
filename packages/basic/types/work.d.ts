import { EventEmitter } from './events';
import { MessageContent, MessageOwner, MessageTransport, MessageTransportCommands, MessageTransportPort } from './transport';
export type MessagePort = {
    onmessage: null | ((data: MessageEvent<unknown>) => void);
    onmessageerror?: null | ((error: any) => void);
    onerror?: null | ((error: any) => void);
    onopen?: null | (() => void);
    postMessage?: (data: string | ArrayBufferLike | ArrayBufferView | Blob | unknown) => void;
    send?: (data: string | ArrayBufferLike | ArrayBufferView | Blob | unknown) => void;
    close: () => void;
};
export declare class WorkPort<T extends string = string> extends EventEmitter<'open' | 'message' | 'error' | 'close' | 'connected' | T> implements MessageTransportPort {
    protected port: MessagePort;
    constructor(port: MessagePort);
    handleMessage: (...args: unknown[]) => boolean;
    handleError: (error: unknown) => boolean;
    handleOpen: (...args: unknown[]) => boolean;
    send(message: unknown): void | null;
    close(): void;
}
export declare class WorkTransport<T extends string = string> extends MessageTransport<WorkPort<T>> {
    _index: number;
    get index(): string;
    /**
     * 连接
     * @param {string} uri
     * @param {WorkPort} port
     */
    connect(uri: unknown): void;
    /**
     * 发送数据
     * @param {MessageContent} content
     * @returns {Promise<unknown>}
     */
    send(content: MessageContent<string | {
        [key: string]: unknown;
    }, MessageTransportCommands>): Promise<MessageOwner>;
}
