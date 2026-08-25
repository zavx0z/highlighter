export type PatternTokenStream = string | PatternToken | PatternTokenStream[];
export type PatternToken = {
    type: string;
    content: PatternTokenStream;
    aliases?: readonly string[];
};
export type PatternGrammar = {
    [token: string]: PatternGrammarValue | PatternGrammar | undefined;
    rest?: PatternGrammar;
};
export type PatternGrammarEntry = RegExp | PatternDefinition;
export type PatternGrammarValue = PatternGrammarEntry | PatternGrammarEntry[];
export type PatternDefinition = {
    pattern: RegExp;
    lookbehind?: boolean;
    greedy?: boolean;
    alias?: string | readonly string[];
    inside?: PatternGrammar | null;
};
export declare function tokenizePatternText(source: string, grammar: PatternGrammar): PatternTokenStream[];
export declare function extendGrammar(base: PatternGrammar, additions: PatternGrammar): PatternGrammar;
export declare function insertBefore(grammar: PatternGrammar, before: string, insert: PatternGrammar): PatternGrammar;
//# sourceMappingURL=pattern-engine.d.ts.map