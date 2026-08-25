import { tokenizeJsonPattern } from "./pattern-highlighter.js";
export function tokenizeJson(lines, options = {}) {
    return tokenizeJsonPattern(lines, options);
}
export const jsonHighlighter = {
    id: "json",
    name: "JSON",
    extensions: ["json"],
    aliases: ["json"],
    tokenize: tokenizeJson,
};
//# sourceMappingURL=json.js.map