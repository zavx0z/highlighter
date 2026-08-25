import { tokenizeMarkdownPattern } from "./pattern-highlighter.js";
export function tokenizeMarkdown(lines, options = {}) {
    return tokenizeMarkdownPattern(lines, options);
}
export const markdownHighlighter = {
    id: "markdown",
    name: "Markdown",
    extensions: ["md", "markdown"],
    aliases: ["md"],
    tokenize: tokenizeMarkdown,
};
//# sourceMappingURL=markdown.js.map