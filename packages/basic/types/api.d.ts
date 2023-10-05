import { EventEmitter } from './events';
import { SubscribeHandle } from './subscribable';
import { Subscribable } from './subscribable';
import { MessageContent, MessageOwner, MessageTransport } from './transport';
export interface ApiParameter {
    name: string;
    description?: string;
    type: string;
    enum?: string[];
}
export interface ApiAction {
    name: string;
    description?: string;
    parameters: ApiParameter[];
}
export interface ApiCommand extends ApiAction {
}
export interface ApiEvent extends ApiAction {
}
export interface ApiDomain {
    name: string;
    description?: string;
    dependencies?: string[];
    types: string[];
    commands: ApiCommand[];
    events: ApiEvent[];
}
export interface ApiJSON {
    version: string;
    domains: ApiDomain[];
}
/**
 * Api 负载
 */
export interface ApiPayload {
    type: 'Command' | 'Event';
    name: string;
    parameters: unknown[];
}
export declare class ApiSubscribables extends Map<string, Subscribable> {
    /**
    */
    subscribe(name: string, subscribeHandle: SubscribeHandle): this;
    /**
    */
    unsubscribe(name: string, subscribeHandle?: SubscribeHandle): this;
    publish(name: string, ...rests: unknown[]): Promise<unknown>;
}
export interface BaseApi<T extends string> {
}
export declare abstract class BaseApi<T extends string> extends EventEmitter<T | string> {
    protected _transport: MessageTransport | null;
    get transport(): MessageTransport | null;
    set transport(transport: MessageTransport | null);
    version: string;
    commands: ApiSubscribables;
    /**
     *
     * @param {ApiJSON} api
     * @param {MessageTransport | null} transport
     */
    constructor(api: ApiJSON, transport?: MessageTransport | null);
    /**
     * 定义 Api
     * @param {ApiDomain[]} domains
     */
    private registerApi;
    /**
     * 定义
     * @param {ApiDomain} domain
     */
    private defineApi;
    abstract send(content: MessageContent): Promise<MessageOwner>;
    /**
     * 订阅
     * @param {string} name
     * @param {SubscribeHandle} subscribeHandle
     * @returns {this}
     */
    subscribe(name: string, subscribeHandle: SubscribeHandle): this;
    /**
     * 取消订阅
     * @param {string} name
     * @param {Subscribable} subscribeHandle
     * @returns {this}
     */
    unsubscribe(name: string, subscribeHandle: SubscribeHandle): this;
}
