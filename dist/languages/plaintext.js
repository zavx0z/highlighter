export function tokenizePlaintext(lines) {
    return lines.map(() => []);
}
export const plaintextHighlighter = {
    id: "plaintext",
    name: "Plain text",
    extensions: ["txt", "text"],
    aliases: ["plain", "text"],
    tokenize: tokenizePlaintext,
};
//# sourceMappingURL=plaintext.js.map