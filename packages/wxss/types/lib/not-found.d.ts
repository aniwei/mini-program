import type { WxssTemplate } from './template';
export declare class NotFoundError extends Error {
    path: string;
    constructor(path: string, template: WxssTemplate);
}
