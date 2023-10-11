export declare class WxWCSC {
    static tryChmod(bin: string): Promise<void>;
    protected bin: string;
    protected root: string;
    constructor(root: string);
    compile(parameters: string[]): Promise<string>;
}
