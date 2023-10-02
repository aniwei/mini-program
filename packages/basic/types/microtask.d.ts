import type { VoidCallback } from '@catalyze/types';
export type MicroTask<T = unknown> = {
    context: T;
    handler: VoidCallback;
    resolve: (value: unknown) => void;
};
export declare class MicroTaskQueue {
    static isUsingMicroTask: boolean;
    static _exec: VoidCallback | null;
    static get exec(): VoidCallback;
    static q: MicroTaskQueue;
    protected queue: MicroTask[];
    protected pending: boolean;
    enqueue<T = unknown>(tick: VoidCallback, resolve: (value: unknown) => void, context: T): void;
    flush(): void;
}
export declare const nextTick: (tick: VoidCallback, context?: unknown) => Promise<unknown>;
