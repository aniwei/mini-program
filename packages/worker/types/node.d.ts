/// <reference types="node" />
import WorkerThread from 'worker_threads';
declare const WORKER_SYMBOL: unique symbol;
type EventHandle = () => void;
declare const _default: void | {
    new (url: string, options?: {
        name: string;
        type: "module" | "classic";
    } | undefined): {
        _onmessage: EventHandle | null;
        onmessage: EventHandle | null;
        _onclose: EventHandle | null;
        onclose: EventHandle | null;
        _onmessageerror: EventHandle | null;
        onmessageerror: EventHandle | null;
        postMessage(data: unknown, transferList?: readonly WorkerThread.TransferListItem[] | undefined): void;
        terminate(): void;
        [WORKER_SYMBOL]: any;
        addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions | undefined): void;
        dispatchEvent(event: Event): boolean;
        removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions | undefined): void;
    };
};
export default _default;
