import { EventEmitter } from '@catalyze/basic';
export declare enum WxErrorCodeKind {
    Timeout = 402,
    Cancelled = 403,
    Scanned = 404,
    Success = 405,
    KeepAlive = 408,
    Error = 500
}
export declare class WxScanCheck extends EventEmitter<`success` | `cancelled` | `scanned` | `timeout` | `error` | `alive`> {
    private timer;
    private duration;
    private aborted;
    constructor(duration?: number);
    run(code: string): void;
    abort(): void;
}
