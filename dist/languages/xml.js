import { tokenizeXmlPattern } from "./pattern-highlighter.js";
export function tokenizeXml(lines, options = {}) {
    return tokenizeXmlPattern(lines, options);
}
export const xmlHighlighter = {
    id: "xml",
    name: "XML / SVG",
    extensions: ["xml", "svg"],
    aliases: ["svg"],
    tokenize: tokenizeXml,
};
//# sourceMappingURL=xml.js.map