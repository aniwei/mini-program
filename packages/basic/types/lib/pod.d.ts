/// <reference types="node" />
import { EventEmitter } from './events';
import { WorkTransport } from './work';
export type Passage = Worker & HTMLIFrameElement & Window & Global;
export declare enum PodStatusKind {
    Created = 1,
    Connected = 2,
    Prepared = 4,
    Booted = 8,
    Inited = 16,
    On = 32,
    Off = 64,
    Active = 128,
    Unactive = 256,
    Destroy = 512
}
export type PodMessagePayload<T> = {
    parameters: T[];
};
export type PodFactory<T> = {
    create(...rests: unknown[]): unknown;
    create<T>(...rests: unknown[]): T;
    new (...rests: unknown[]): T;
};
export declare abstract class Pod extends WorkTransport {
    /**
     *
     * @param {unknown[]} rests
     */
    static create(...rests: unknown[]): unknown;
    static create<T extends Pod>(...rests: unknown[]): T;
    _status: PodStatusKind;
    get status(): PodStatusKind;
    set status(status: PodStatusKind);
    constructor(...rests: unknown[]);
    idle(): void;
    busy(): void;
}
export declare abstract class ProxyPod extends Pod {
    static boot<T extends ProxyPod>(...rests: unknown[]): T;
    static boot<T extends ProxyPod>(...rests: unknown[]): T;
    _passage: Passage | null;
    get passage(): Passage;
    set passage(passage: Passage);
    constructor(...rests: unknown[]);
    onMessage: (event: MessageEvent<{
        status: 'connected';
    }>) => void;
    onError: (error: any) => void;
    runTask<T>(...rests: unknown[]): Promise<T>;
    init(...rests: unknown[]): Promise<void>;
}
export type PodQueueHandle = () => void;
export type MainPodFactory<T> = {
    create(...rests: unknown[]): unknown;
    create<P extends ProxyPod, T extends MainPod<P>>(...rests: unknown[]): T;
    create<P extends ProxyPod, T extends MainPod<P>>(proxies: P[]): T;
    new (...rests: unknown[]): T;
};
export declare abstract class MainPod<P extends ProxyPod> extends EventEmitter<'booted' | 'connected' | string> {
    static create(...rests: unknown[]): unknown;
    static create<P extends ProxyPod, T extends MainPod<P>>(...rests: unknown[]): T;
    get count(): number;
    _proxies: P[];
    get proxies(): P[];
    set proxies(proxies: P[]);
    queue: PodQueueHandle[];
    findByStatus(status?: PodStatusKind): P | null;
    runTask<R>(...parameters: unknown[]): Promise<R>;
    init(...rests: unknown[]): Promise<void[]>;
}
