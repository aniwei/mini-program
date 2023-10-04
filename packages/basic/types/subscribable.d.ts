import { EventEmitter } from './events';
export type SubscribeHandle = (...args: any[]) => Promise<unknown> | unknown;
export type Subscriber<T extends SubscribeHandle> = {
    handler: T;
    context: unknown;
    once: boolean;
};
export declare class Subscribable<E extends string = string, T extends SubscribeHandle = SubscribeHandle> extends EventEmitter<E> {
    private subscribers;
    get size(): number;
    /**
     * 订阅消息
     * @param {T} handler
     * @param {unknown} context
     * @param {boolean} once
     */
    subscribe(handler: T, context?: unknown, once?: boolean): void;
    /**
     * 取消订阅
     * @param {T} handler
     * @param {unknown} context
     */
    unsubscribe(handler?: T, context?: unknown): void;
    /**
     * 发布消息
     * @param {unknown[]} rests
     * @returns
     */
    publish<R = unknown>(...rests: unknown[]): Promise<R | undefined>;
    clear(): void;
}
