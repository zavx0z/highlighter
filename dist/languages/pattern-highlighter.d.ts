import type { EditorTokens, TokenizeOptions } from "../tokens.ts";
import { type RangeToken } from "./range-tokens.ts";
import { type PatternLanguageId } from "./pattern-languages.ts";
export declare function tokenizePattern(lines: readonly string[], language: PatternLanguageId, options?: TokenizeOptions): EditorTokens;
export declare function tokenizeTypeScriptPattern(lines: readonly string[], options?: TokenizeOptions): EditorTokens;
export declare function tokenizeSqlitePattern(lines: readonly string[], options?: TokenizeOptions): EditorTokens;
export declare function tokenizeJsonPattern(lines: readonly string[], options?: TokenizeOptions): EditorTokens;
export declare function tokenizeXmlPattern(lines: readonly string[], options?: TokenizeOptions): EditorTokens;
export declare function tokenizeHtmlPattern(lines: readonly string[], options?: TokenizeOptions): EditorTokens;
export declare function tokenizeMarkdownPattern(lines: readonly string[], options?: TokenizeOptions): EditorTokens;
export declare function tokenizeSourcePattern(lines: readonly string[], opts?: TokenizeOptions & {
    path?: string;
}): EditorTokens;
export declare function tokenizePatternRangeTokens(source: string, base: number, language: PatternLanguageId, options?: TokenizeOptions): RangeToken[];
export declare function tokenizePatternRanges(source: string, base: number, language: PatternLanguageId, push: (s: number, e: number, c: string, bg?: string, fg?: string) => void, options?: TokenizeOptions): void;
//# sourceMappingURL=pattern-highlighter.d.ts.map