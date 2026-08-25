import type { EditorTokens, LanguageHighlighter, TokenizeOptions } from "../tokens.ts";
import { tokenizePatternRanges } from "./pattern-highlighter.ts";
export declare function tokenizeSqlite(lines: readonly string[], options?: TokenizeOptions): EditorTokens;
export { tokenizePatternRanges as tokenizeSqliteRanges };
export declare const sqliteHighlighter: LanguageHighlighter;
//# sourceMappingURL=sqlite.d.ts.map