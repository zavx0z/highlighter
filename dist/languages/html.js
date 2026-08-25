import { tokenizeHtmlPattern } from "./pattern-highlighter.js";
export function tokenizeHtml(lines, options = {}) {
    return tokenizeHtmlPattern(lines, options);
}
export const htmlHighlighter = {
    id: "html",
    name: "HTML / CSS / JS / TS",
    extensions: ["html", "htm"],
    aliases: ["markup", "proposal"],
    tokenize: tokenizeHtml,
};
//# sourceMappingURL=html.js.map