import { MainPod, ProxyPod } from '@catalyzed/basic';
export declare enum BuildTypeKind {
    Less = 0,
    Sass = 1,
    JS = 2,
    TS = 3
}
export type BuildSource = {
    root: string;
    ext: string;
    name: string;
    content: string;
    sourceMaps: boolean | string;
};
export type BuildTask = {
    source: BuildSource;
    type: BuildTypeKind;
};
export declare class ProxyBuilder extends ProxyPod {
    build(...rests: unknown[]): Promise<string>;
    constructor();
    runTask<T>(...rests: unknown[]): Promise<T>;
    init(): Promise<void>;
}
export declare class MainBuilder extends MainPod<ProxyBuilder> {
    static create(...rests: unknown[]): MainBuilder;
}
