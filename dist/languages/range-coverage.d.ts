import type { RangeToken } from "./range-tokens.ts";
export type TokenCoverage = (start: number, end: number) => boolean;
/** Tests containment by one original token, not by a union of adjacent tokens. */
export declare function createTokenCoverage(tokens: readonly RangeToken[]): TokenCoverage;
//# sourceMappingURL=range-coverage.d.ts.map