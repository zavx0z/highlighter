import type { LanguageHighlighter, TokenizeOptions, Tokens } from "../tokens.ts";
/** JSX/TSX-разметка с TypeScript-подсветкой вложенных выражений. */
export declare function tokenizeJsx(lines: readonly string[], options?: TokenizeOptions): Tokens;
export declare const jsxHighlighter: LanguageHighlighter;
export declare const tsxHighlighter: LanguageHighlighter;
//# sourceMappingURL=jsx.d.ts.map