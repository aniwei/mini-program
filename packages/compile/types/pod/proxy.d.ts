import { ProxyPod, MainPod } from '@catalyze/basic';
export type CompileType = 'XML' | 'CSS';
export declare abstract class ProxyCompile extends ProxyPod {
    protected _root: string | null;
    get root(): string;
    set root(root: string);
    isContextReady(): void;
}
export declare class ProxyCompilePod extends ProxyCompile {
    /**
     *
     * @param root
     * @param uri
     * @returns
     */
    static boot(root: string, uri: string): ProxyCompilePod;
    constructor();
    init(): Promise<void>;
    /**
     *
     * @param rests
     */
    runTask<T>(...rests: unknown[]): Promise<T>;
}
export declare class MainCompilePod extends MainPod<ProxyCompilePod> {
    static create(...rests: unknown[]): unknown;
}
