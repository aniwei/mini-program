import { EventEmitter } from './events';
export type MessageTransportCommands = 'message::received' | 'message::callback' | 'message::except' | 'message::content' | 'endpoint::connect' | 'endpoint::authenticate' | string;
/**
 * 指令处理函数
 */
type MessageHandle = (messager: MessageOwner) => Promise<MessageOwner | MessageContent | void> | void;
export type MessageContent<T = {
    [key: string]: unknown;
} | string | null | undefined | void, C extends MessageTransportCommands = MessageTransportCommands> = {
    id?: string;
    sid?: string;
    command?: C;
    payload?: T;
};
export declare enum MessageOwnerStateKind {
    Active = 1,
    Replied = 2
}
export declare abstract class MessageTransportPort {
    abstract send(message: unknown): void;
    abstract close(): void;
    abstract on(event: 'message' | 'close' | 'error', listener: () => void): this;
    abstract once(event: 'message' | 'close' | 'error', listener: () => void): this;
    abstract off(event: 'message' | 'close' | 'error', listener: () => void): this;
    abstract removeAllListeners(event?: string | symbol): this;
}
export declare class MessageError extends Error {
    sid: string;
    detail: string;
    command: MessageTransportCommands;
    /**
     *
     * @param messager
     */
    constructor(messager: MessageOwner);
}
/**
 * 信息对象
 */
export declare class MessageOwner {
    transport: MessageTransport;
    content: MessageContent;
    state: MessageOwnerStateKind;
    get id(): string | undefined;
    get sid(): string | undefined;
    get payload(): string | void | {
        [key: string]: unknown;
    } | null | undefined;
    get command(): string | undefined;
    /**
     * 构造信息对象
     * @param {MessageTransport} transport 终端
     * @param {MessageContent} content
     */
    constructor(transport: MessageTransport, content: MessageContent);
    /**
     * 发送指令
     * @param {MessageContent} content
     * @returns {Promise<Messager>}
     */
    send(content: MessageContent): Promise<MessageOwner>;
    /**
     * 回复指令
     * @param {MessageContent} content
     */
    reply(content: MessageContent): void;
    /**
     * 回复收到指令
     */
    receive(): void;
}
export declare enum MessageTransportStateKind {
    Ready = 1,
    Connected = 2,
    Disconnected = 4,
    Error = 8
}
/**
 * 终端
 */
export declare abstract class MessageTransport<T extends MessageTransportPort = MessageTransportPort, S extends MessageTransportStateKind = MessageTransportStateKind, Command extends MessageTransportCommands = MessageTransportCommands> extends EventEmitter<`open` | `close` | `message` | `error` | string> {
    state: S;
    transport: T | null;
    commands: Map<Command, MessageHandle> | null;
    constructor();
    /**
     * 注册指令
     * @param {MessageCommands} command
     * @param {MessageHandle} handle
     * @returns
     */
    command(command: Command, handle: MessageHandle): this;
    /**
     * 注册基本指令
     */
    registerCommands(): void;
    connect(transport: unknown): void;
    /**
     * 指令异常
     * @param {string} sid
     * @param {any} error
     */
    except(sid: string, error: any): void;
    abstract send(content: MessageContent): Promise<MessageOwner>;
    /**
     * 关闭终端
     */
    close(): void;
    /**
     * 终端描述
     * @returns {{}}
     */
    toJSON(): unknown;
}
export {};
