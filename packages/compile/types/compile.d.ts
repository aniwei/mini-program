import { WxAssetsBundle } from './asset';
export interface WxAssetCompiledFile {
    filename: string;
    source: string;
}
export declare enum WxWxssAssetKind {
    Version = "version",
    Common = "comm",
    IgnoreAppWXSS = "./app.wxss"
}
export declare class WxAssetsCompile extends WxAssetsBundle {
    unescape(wxss: string): WxAssetCompiledFile[];
    compile(): Promise<undefined>;
}
