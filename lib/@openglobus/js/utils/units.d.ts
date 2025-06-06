export declare const ELL = 0;
export declare const MSL = 1;
export declare const GND = 2;
export declare const heightMode: Record<string, number>;
export declare const m = 0;
export declare const km = 1;
export declare const ft = 2;
export declare const s = 3;
export declare const h = 4;
export declare const ms = 5;
export declare const kmh = 6;
export declare const fts = 7;
export declare const _tenth: number[];
export declare function convert(from: number, to: number, val: number): number;
export declare function convertExt(isNotNaN: boolean, unitFrom: number, unitTo: number, val: number, fixed?: number): string;
export declare function toString(u: number): string;
