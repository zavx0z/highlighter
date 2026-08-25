import type { Tokens } from "../tokens.ts";
export type SyntaxCategory = "k" | "s" | "n" | "c" | "t" | "f" | "p" | "d";
export type RangeToken = {
    s: number;
    e: number;
    c: SyntaxCategory | string;
    fg?: string;
    bg?: string;
};
export type RangePush = (s: number, e: number, c: SyntaxCategory | string, bg?: string, fg?: string) => void;
export declare function pushRange(tokens: RangeToken[], s: number, e: number, c: SyntaxCategory | string, bg?: string, fg?: string): void;
export declare function distributeRangeTokens(tokens: readonly RangeToken[], lines: readonly string[]): Tokens;
//# sourceMappingURL=range-tokens.d.ts.map