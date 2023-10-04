type ListenerHandler = (...args: any[]) => void;
type Listener = {
    handler: ListenerHandler;
    context: unknown;
    once: boolean;
};
export declare class EventEmitter<T extends string> {
    events: Map<T, Listener[]>;
    eventNames(): string[];
    listeners(event: T): Listener[];
    listenerCount(event: T): number;
    emit(event: T, ...args: unknown[]): boolean;
    on(event: T, handler: ListenerHandler, context?: unknown): this;
    once(event: T, handler: ListenerHandler, context?: unknown): this;
    off(event: T, handler?: ListenerHandler, context?: unknown): this;
    addListener(event: T, handler: ListenerHandler, context: unknown, once: boolean): this;
    removeListener(event: T, handler?: ListenerHandler, context?: unknown, once?: boolean): this;
    removeAllListeners(event?: T): this;
}
export {};
