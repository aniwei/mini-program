/// <reference types="node" />
import { AssetHash, AssetJSON, EventEmitter } from '@catalyze/basic';
import type { FSModule } from 'browserfs/dist/node/core/FS';
interface App {
    appid: string;
    assets: AssetHash[];
}
declare abstract class FileSystem extends EventEmitter<string> {
    fsModule: FSModule;
    constructor(fsModule: FSModule);
    existsAsync(path: string): Promise<boolean>;
    mkdirAsync(path: string): Promise<void>;
    mkdirpAsync(path: string): Promise<void>;
    readdirAsync(path: string): Promise<string[]>;
    readFileAsync(filename: string): Promise<Buffer>;
    readJSONAsync(filename: string): Promise<any>;
    writeFileAsync(filename: string, data: Buffer | string): Promise<void>;
    removeAsync(path: string): Promise<void>;
}
export declare class Store extends FileSystem {
    static create(): Promise<Store>;
    ensure(): Promise<App[]>;
    read(app: App): Promise<AssetJSON[]>;
    save(appid: string, assets: AssetJSON[]): Promise<void>;
    clear(): Promise<string[]>;
}
export {};
