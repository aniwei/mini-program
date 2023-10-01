export declare const defineReadAndWriteProperty: <T>(target: {
    hasOwnProperty: (name: string) => boolean;
}, name: PropertyKey, defaultValue: T, force?: boolean) => void;
export declare const defineReadOnlyProperty: <T>(target: {
    hasOwnProperty: (name: string) => boolean;
}, name: PropertyKey, value: T) => void;
