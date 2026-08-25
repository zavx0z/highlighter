import { tokenizeTypeScriptPattern } from "./pattern-highlighter.js";
export function tokenizeTypeScript(lines, options = {}) {
    return tokenizeTypeScriptPattern(lines, options);
}
export const typescriptHighlighter = {
    id: "typescript",
    name: "TypeScript / JavaScript",
    extensions: ["ts", "mts", "cts", "js", "mjs", "cjs"],
    aliases: ["ts", "js", "javascript"],
    tokenize: tokenizeTypeScript,
};
//# sourceMappingURL=typescript.js.map