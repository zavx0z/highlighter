import type { LanguageHighlighter, TokenizeOptions, Tokens } from "../tokens.ts";
import { tokenizePatternRanges } from "./pattern-highlighter.ts";
export declare function tokenizeSqlite(lines: readonly string[], options?: TokenizeOptions): Tokens;
export { tokenizePatternRanges as tokenizeSqliteRanges };
export declare const sqliteHighlighter: LanguageHighlighter;
//# sourceMappingURL=sqlite.d.ts.map