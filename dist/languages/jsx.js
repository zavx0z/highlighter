import { tokenizeJsxPattern } from "./pattern-highlighter.js";
/** JSX/TSX-разметка с TypeScript-подсветкой вложенных выражений. */
export function tokenizeJsx(lines, options = {}) {
    return tokenizeJsxPattern(lines, options);
}
export const jsxHighlighter = {
    id: "jsx",
    name: "JavaScript JSX",
    extensions: ["jsx"],
    aliases: ["javascriptreact"],
    tokenize: tokenizeJsx,
};
export const tsxHighlighter = {
    id: "tsx",
    name: "TypeScript TSX",
    extensions: ["tsx"],
    aliases: ["typescriptreact"],
    tokenize: tokenizeJsx,
};
//# sourceMappingURL=jsx.js.map