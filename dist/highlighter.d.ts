import type { LanguageHighlighter, TokenizeOptions, Tokens } from "./tokens.ts";
export type ResolveHighlighterOptions = {
    languageId?: string;
    path?: string;
    filename?: string;
    fallbackLanguageId?: string;
};
export type TokenizeSourceOptions = ResolveHighlighterOptions & TokenizeOptions;
export type HighlighterRegistry = {
    register(highlighter: LanguageHighlighter): void;
    list(): readonly LanguageHighlighter[];
    resolve(options?: ResolveHighlighterOptions): LanguageHighlighter;
};
export declare const builtInLanguageHighlighters: readonly LanguageHighlighter[];
export declare function createHighlighterRegistry(initial?: readonly LanguageHighlighter[]): HighlighterRegistry;
export declare const defaultHighlighterRegistry: HighlighterRegistry;
export declare function registerLanguageHighlighter(highlighter: LanguageHighlighter): void;
export declare function listLanguageHighlighters(): readonly LanguageHighlighter[];
export declare function resolveLanguageHighlighter(options?: ResolveHighlighterOptions): LanguageHighlighter;
export declare function tokenizeLines(lines: readonly string[], options?: TokenizeSourceOptions): Tokens;
export declare function tokenize(source: string, options?: TokenizeSourceOptions): Tokens;
//# sourceMappingURL=highlighter.d.ts.map