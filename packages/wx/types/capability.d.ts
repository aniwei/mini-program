export type CapabilityHandle = (...rest: any[]) => unknown | Promise<unknown>;
export type CapabilityType = 'async' | 'sync';
export interface Capability {
    key: string;
    type: CapabilityType;
    handle: CapabilityHandle;
}
export declare abstract class WxCapability<T> extends Map<string, Capability> {
    proxy: T;
    constructor(proxy: T, ...rest: unknown[]);
    invoke(key: string, ...rest: unknown[]): {};
    on(key: string, handle: CapabilityHandle, type?: CapabilityType): this;
}
export interface WxCapabilityFactory<T> {
    kSymbol: Symbol;
    create: (proxy: T, ...rests: unknown[]) => Promise<T>;
    new (proxy: T, ...rests: unknown[]): T;
}
