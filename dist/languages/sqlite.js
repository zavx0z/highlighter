import { tokenizePatternRanges, tokenizeSqlitePattern } from "./pattern-highlighter.js";
export function tokenizeSqlite(lines, options = {}) {
    return tokenizeSqlitePattern(lines, options);
}
export { tokenizePatternRanges as tokenizeSqliteRanges };
export const sqliteHighlighter = {
    id: "sqlite",
    name: "SQLite",
    extensions: ["sql", "sqlite"],
    aliases: ["sql", "sqlite"],
    tokenize: tokenizeSqlite,
};
//# sourceMappingURL=sqlite.js.map