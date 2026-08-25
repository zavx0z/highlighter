import { cssHighlighter } from "./languages/css.js";
import { htmlHighlighter } from "./languages/html.js";
import { jsonHighlighter } from "./languages/json.js";
import { markdownHighlighter } from "./languages/markdown.js";
import { plaintextHighlighter } from "./languages/plaintext.js";
import { sqliteHighlighter } from "./languages/sqlite.js";
import { typescriptHighlighter } from "./languages/typescript.js";
import { xmlHighlighter } from "./languages/xml.js";
export const builtInLanguageHighlighters = [
    plaintextHighlighter,
    markdownHighlighter,
    typescriptHighlighter,
    sqliteHighlighter,
    cssHighlighter,
    xmlHighlighter,
    htmlHighlighter,
    jsonHighlighter,
];
export function createHighlighterRegistry(initial = builtInLanguageHighlighters) {
    const registry = [...initial];
    return {
        register(highlighter) {
            const index = registry.findIndex((item) => item.id === highlighter.id);
            if (index >= 0)
                registry[index] = highlighter;
            else
                registry.push(highlighter);
        },
        list() {
            return registry;
        },
        resolve(options = {}) {
            return resolveFromRegistry(registry, options);
        },
    };
}
export const defaultHighlighterRegistry = createHighlighterRegistry();
export function registerLanguageHighlighter(highlighter) {
    defaultHighlighterRegistry.register(highlighter);
}
export function listLanguageHighlighters() {
    return defaultHighlighterRegistry.list();
}
export function resolveLanguageHighlighter(options = {}) {
    return defaultHighlighterRegistry.resolve(options);
}
export function tokenizeLines(lines, options = {}) {
    const highlighter = resolveLanguageHighlighter(options);
    return highlighter.tokenize(lines, tokenizeOptions(options));
}
export function tokenize(source, options = {}) {
    return tokenizeLines(source.split("\n"), options);
}
function resolveFromRegistry(registry, options) {
    const languageId = options.languageId?.toLowerCase();
    const explicit = languageId === undefined ? undefined : byLanguageId(registry, languageId);
    if (explicit !== undefined)
        return explicit;
    const extension = extensionOf(options.filename ?? options.path ?? "");
    const byExtension = extension.length === 0
        ? undefined
        : registry.find((item) => (item.extensions ?? []).some((candidate) => candidate.toLowerCase() === extension));
    if (byExtension !== undefined)
        return byExtension;
    const fallbackId = options.fallbackLanguageId?.toLowerCase() ?? "plaintext";
    return byLanguageId(registry, fallbackId)
        ?? byLanguageId(registry, "plaintext")
        ?? registry[0]
        ?? plaintextHighlighter;
}
function byLanguageId(registry, languageId) {
    return registry.find((item) => item.id.toLowerCase() === languageId ||
        (item.aliases ?? []).some((alias) => alias.toLowerCase() === languageId));
}
function extensionOf(path) {
    const withoutQuery = path.split("?")[0]?.split("#")[0] ?? path;
    const slash = Math.max(withoutQuery.lastIndexOf("/"), withoutQuery.lastIndexOf("\\"));
    const file = withoutQuery.slice(slash + 1);
    const dot = file.lastIndexOf(".");
    if (dot < 0 || dot === file.length - 1)
        return "";
    return file.slice(dot + 1).toLowerCase();
}
function tokenizeOptions(options) {
    return options.resolveForeground === undefined
        ? {}
        : { resolveForeground: options.resolveForeground };
}
//# sourceMappingURL=highlighter.js.map