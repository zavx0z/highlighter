import { distributeRangeTokens, pushRange } from "./range-tokens.js";
import { tokenizePatternText } from "./pattern-engine.js";
import { patternLanguages } from "./pattern-languages.js";
const SCOPE_MAP = {
    "at": ["punctuation.decorator", "keyword.operator"],
    "atrule": ["keyword.other", "keyword"],
    "attr-name": ["entity.other.attribute-name"],
    "attr-value": ["string"],
    "boolean": ["constant.language.boolean"],
    "builtin": ["support.type", "support.function"],
    "class-name": ["entity.name.type.class", "entity.name.type"],
    "comment": ["comment"],
    "constant": ["constant.other", "constant.language"],
    "decorator": ["meta.decorator", "punctuation.decorator"],
    "doctype": ["meta.tag.sgml.doctype"],
    "doctype-tag": ["keyword"],
    "entity": ["constant.character.entity"],
    "function": ["entity.name.function", "support.function"],
    "function-variable": ["entity.name.function", "support.function"],
    "generic": ["entity.name.type.class", "entity.name.type"],
    "generic-function": ["entity.name.function", "support.function"],
    "hashbang": ["comment"],
    "hex-color": ["constant.other.color"],
    "identifier": ["entity.name.type"],
    "important": ["keyword.other.important"],
    "inline-template": ["entity.name.function"],
    "keyword": ["keyword"],
    "name": ["entity.name.tag"],
    "number": ["constant.numeric"],
    "operator": ["keyword.operator"],
    "parameter": ["variable.parameter"],
    "property": ["variable.other.property", "support.variable.property"],
    "prolog": ["meta.tag.preprocessor"],
    "punctuation": ["punctuation.separator", "punctuation"],
    "primitive-type": ["storage.type", "support.type"],
    "regex": ["string.regexp"],
    "rule": ["keyword.other"],
    "selector": ["entity.other.attribute-name.class.css", "entity.name.tag"],
    "selector-function-argument": ["entity.other.attribute-name.class.css", "entity.name.tag"],
    "string": ["string"],
    "string-property": ["variable.other.property", "support.variable.property"],
    "tag": ["entity.name.tag"],
    "tag-punctuation": ["punctuation.definition.tag", "entity.name.tag"],
    "template-string": ["string.template", "string"],
    "url": ["string"],
    "variable": ["variable.other.readwrite", "variable"],
};
const CATEGORY_MAP = {
    "at": "p",
    "atrule": "k",
    "attr-name": "t",
    "attr-value": "s",
    "boolean": "k",
    "builtin": "t",
    "class-name": "t",
    "comment": "c",
    "constant": "n",
    "decorator": "t",
    "doctype": "k",
    "doctype-tag": "k",
    "entity": "n",
    "function": "f",
    "function-variable": "f",
    "generic": "t",
    "generic-function": "f",
    "hashbang": "c",
    "hex-color": "n",
    "identifier": "t",
    "important": "k",
    "inline-template": "f",
    "keyword": "k",
    "name": "t",
    "number": "n",
    "operator": "p",
    "parameter": "d",
    "property": "t",
    "prolog": "k",
    "punctuation": "p",
    "primitive-type": "t",
    "regex": "n",
    "rule": "k",
    "selector": "t",
    "selector-function-argument": "t",
    "string": "s",
    "string-property": "t",
    "tag": "k",
    "tag-punctuation": "p",
    "template-string": "s",
    "url": "s",
    "variable": "d",
};
const TEST_HELPER_FUNCTIONS = new Set([
    "afterAll", "afterEach", "beforeAll", "beforeEach", "describe", "expect",
    "it", "mock", "spyOn", "test",
]);
export function tokenizePattern(lines, language, options = {}) {
    const source = lines.join("\n");
    return distributeRangeTokens(tokenizePatternRangeTokens(source, 0, language, options), lines);
}
export function tokenizeTypeScriptPattern(lines, options = {}) {
    return applySqlTemplateOverlays(tokenizePattern(lines, "typescript", options), lines, options);
}
export function tokenizeSqlitePattern(lines, options = {}) {
    return tokenizePattern(lines, "sql", options);
}
export function tokenizeJsonPattern(lines, options = {}) {
    return tokenizePattern(lines, "json", options);
}
export function tokenizeXmlPattern(lines, options = {}) {
    return tokenizePattern(lines, "xml", options);
}
export function tokenizeHtmlPattern(lines, options = {}) {
    return tokenizePattern(lines, "markup", options);
}
export function tokenizeMarkdownPattern(lines, options = {}) {
    const result = lines.map(() => []);
    for (let lineIndex = 0; lineIndex < lines.length;) {
        const line = lines[lineIndex] ?? "";
        const fence = markdownFenceOpen(line);
        if (fence !== null) {
            result[lineIndex] = tokenizeMarkdownFenceLine(line, fence);
            const contentStart = lineIndex + 1;
            let contentEnd = contentStart;
            while (contentEnd < lines.length && !markdownFenceClose(lines[contentEnd] ?? "", fence))
                contentEnd++;
            const contentTokens = tokenizeMarkdownFenceContent(lines.slice(contentStart, contentEnd), fence.info, options);
            for (let i = 0; i < contentTokens.length; i++)
                result[contentStart + i] = contentTokens[i] ?? [];
            if (contentEnd < lines.length) {
                result[contentEnd] = tokenizeMarkdownFenceLine(lines[contentEnd] ?? "", fence);
                lineIndex = contentEnd + 1;
            }
            else {
                lineIndex = contentEnd;
            }
            continue;
        }
        result[lineIndex] = tokenizeMarkdownLine(line);
        lineIndex++;
    }
    return result;
}
export function tokenizeSourcePattern(lines, opts = {}) {
    if (isHtmlPath(opts.path))
        return tokenizeHtmlPattern(lines, opts);
    if (isCssPath(opts.path))
        return tokenizePattern(lines, "css", opts);
    if (isXmlPath(opts.path))
        return tokenizeXmlPattern(lines, opts);
    if (isJsonPath(opts.path))
        return tokenizeJsonPattern(lines, opts);
    if (isSqlitePath(opts.path))
        return tokenizeSqlitePattern(lines, opts);
    if (isMarkdownPath(opts.path))
        return tokenizeMarkdownPattern(lines, opts);
    return tokenizeTypeScriptPattern(lines, opts);
}
export function tokenizePatternRangeTokens(source, base, language, options = {}) {
    const grammar = patternLanguages[language];
    const tokens = [];
    flattenPatternTokens(tokenizePatternText(source, grammar), base, undefined, tokens, options.resolveForeground);
    if (language === "css" || language === "markup")
        applyCssColorFunctionSwatches(source, base, tokens);
    if (language === "typescript" || language === "javascript") {
        applySemanticIdentifierOverlays(source, base, tokens, options.resolveForeground);
        applyTemplateLiteralOverlays(source, base, tokens, "typescript", options);
    }
    return tokens.sort(compareRangeTokens);
}
export function tokenizePatternRanges(source, base, language, push, options = {}) {
    for (const token of tokenizePatternRangeTokens(source, base, language, options)) {
        push(token.s, token.e, token.c, token.bg, token.fg);
    }
}
function flattenPatternTokens(stream, start, inheritedTypes, out, resolveForeground) {
    if (typeof stream === "string") {
        pushPatternToken(out, start, start + stream.length, inheritedTypes, stream, resolveForeground);
        return start + stream.length;
    }
    if (Array.isArray(stream)) {
        let cursor = start;
        for (const item of stream)
            cursor = flattenPatternTokens(item, cursor, inheritedTypes, out, resolveForeground);
        return cursor;
    }
    const types = stream.aliases === undefined ? [stream.type] : [stream.type, ...stream.aliases];
    return flattenPatternTokens(stream.content, start, types, out, resolveForeground);
}
function pushPatternToken(out, s, e, types, text, resolveForeground) {
    if (types === undefined || e <= s)
        return;
    const fg = colorForTypes(types, resolveForeground);
    const bg = types.includes("hex-color") ? text : undefined;
    pushRange(out, s, e, categoryForTypes(types), bg, fg);
}
function applyCssColorFunctionSwatches(source, base, tokens) {
    const colorRe = /\brgba?\(\s*(?:(?:[+-]?(?:\d+(?:\.\d+)?|\.\d+)%?)\s*(?:,\s*|\s+)){2}[+-]?(?:\d+(?:\.\d+)?|\.\d+)%?(?:\s*(?:,\s*|\/\s*)[+-]?(?:\d+(?:\.\d+)?|\.\d+)%?)?\s*\)/gi;
    for (const match of source.matchAll(colorRe)) {
        const text = match[0];
        const start = base + (match.index ?? 0);
        const nameEnd = start + (text.startsWith("rgba") ? 4 : 3);
        const token = tokens.find((item) => item.s === start && item.e === nameEnd && item.c === "f");
        if (token !== undefined)
            token.bg = text;
    }
}
function colorForTypes(types, resolveForeground) {
    if (resolveForeground === undefined)
        return undefined;
    for (const type of types) {
        const color = resolveForeground(SCOPE_MAP[type] ?? [type]);
        if (color !== undefined)
            return color;
    }
    return undefined;
}
function categoryForTypes(types) {
    for (const type of types) {
        const category = CATEGORY_MAP[type];
        if (category !== undefined)
            return category;
    }
    return "d";
}
function compareRangeTokens(left, right) {
    return left.s - right.s || left.e - right.e;
}
function applySemanticIdentifierOverlays(source, base, tokens, resolveForeground) {
    applyObjectKeyOverlays(source, base, tokens, resolveForeground);
    applyParameterOverlays(source, base, tokens, resolveForeground);
    const identRe = /[$_\p{ID_Start}][$_\u200c\u200d\p{ID_Continue}]*/gu;
    for (const match of source.matchAll(identRe)) {
        const text = match[0];
        const start = base + (match.index ?? 0);
        const end = start + text.length;
        if (hasTokenCovering(tokens, start, end))
            continue;
        if (TEST_HELPER_FUNCTIONS.has(text) || isFunctionLead(source, end)) {
            pushRange(tokens, start, end, "f", undefined, colorForTypes(["function"], resolveForeground));
        }
        else if (/^[A-Z]/.test(text)) {
            pushRange(tokens, start, end, "t", undefined, colorForTypes(["class-name"], resolveForeground));
        }
    }
    applyMemberAccessOverlays(source, base, tokens, resolveForeground);
}
function applyObjectKeyOverlays(source, base, tokens, resolveForeground) {
    const keyRe = /(^|[,{])([ \t]*)([$_\p{ID_Start}][$_\u200c\u200d\p{ID_Continue}]*)(?=\s*:)/gmu;
    for (const match of source.matchAll(keyRe)) {
        const text = match[3];
        if (text === undefined)
            continue;
        const start = (match.index ?? 0) + match[1].length + match[2].length;
        if (nearestContainer(source, start) !== "{")
            continue;
        pushPropertyToken(base, tokens, start, text.length, resolveForeground);
    }
}
function applyParameterOverlays(source, base, tokens, resolveForeground) {
    const parameterRe = /[$_\p{ID_Start}][$_\u200c\u200d\p{ID_Continue}]*(?=\s*\??\s*:)/gu;
    for (const match of source.matchAll(parameterRe)) {
        const text = match[0];
        const start = match.index ?? 0;
        if (nearestContainer(source, start) !== "(")
            continue;
        pushParameterToken(source, base, tokens, start, text.length, resolveForeground);
    }
}
function applyMemberAccessOverlays(source, base, tokens, resolveForeground) {
    const memberRe = /(?:\?\.|\.)\s*([$_\p{ID_Start}][$_\u200c\u200d\p{ID_Continue}]*)/gu;
    for (const match of source.matchAll(memberRe)) {
        const text = match[1];
        if (text === undefined)
            continue;
        const accessorStart = match.index ?? 0;
        const propertyStart = accessorStart + match[0].length - text.length;
        pushMemberPropertyToken(base, tokens, accessorStart, propertyStart, text.length, resolveForeground);
    }
}
function pushParameterToken(source, base, tokens, start, length, resolveForeground) {
    const end = start + length;
    const absStart = base + start;
    const absEnd = base + end;
    if (hasTokenCovering(tokens, absStart, absEnd))
        return;
    pushRange(tokens, absStart, absEnd, "d", undefined, colorForTypes(["parameter"], resolveForeground));
}
function pushPropertyToken(base, tokens, start, length, resolveForeground) {
    const absStart = base + start;
    const absEnd = absStart + length;
    if (hasTokenCovering(tokens, absStart, absEnd))
        return;
    pushRange(tokens, absStart, absEnd, "t", undefined, colorForTypes(["property"], resolveForeground));
}
function pushMemberPropertyToken(base, tokens, accessorStart, propertyStart, propertyLength, resolveForeground) {
    const propertyAbsStart = base + propertyStart;
    const propertyAbsEnd = propertyAbsStart + propertyLength;
    if (hasTokenCovering(tokens, propertyAbsStart, propertyAbsEnd))
        return;
    pushRange(tokens, base + accessorStart, propertyAbsEnd, "t", undefined, colorForTypes(["property"], resolveForeground));
}
function nearestContainer(source, end) {
    const stack = [];
    for (let i = 0; i < end; i++) {
        const ch = source[i] ?? "";
        if (ch === "\"" || ch === "'" || ch === "`") {
            i = Math.max(i, scanQuoted(source, i, ch) - 1);
            continue;
        }
        if (ch === "/" && source[i + 1] === "/") {
            const next = source.indexOf("\n", i + 2);
            i = next < 0 ? end : next;
            continue;
        }
        if (ch === "/" && source[i + 1] === "*") {
            const next = source.indexOf("*/", i + 2);
            i = next < 0 ? end : next + 1;
            continue;
        }
        if (ch === "{" || ch === "(" || ch === "[")
            stack.push(ch);
        else if (ch === "}")
            popContainer(stack, "{");
        else if (ch === ")")
            popContainer(stack, "(");
        else if (ch === "]")
            popContainer(stack, "[");
    }
    return stack[stack.length - 1];
}
function popContainer(stack, opener) {
    for (let i = stack.length - 1; i >= 0; i--) {
        const current = stack.pop();
        if (current === opener)
            return;
    }
}
function hasTokenCovering(tokens, start, end) {
    return tokens.some((token) => token.s <= start && token.e >= end);
}
function isFunctionLead(source, start) {
    let i = skipWhitespaceRight(source, start);
    if (source[i] === "(" || source[i] === "`")
        return true;
    if (source[i] === "?" && source[i + 1] === "." && source[i + 2] === "(")
        return true;
    if (source[i] !== "<")
        return false;
    let angle = 0;
    for (; i < source.length; i++) {
        const ch = source[i] ?? "";
        if (ch === "\"" || ch === "'" || ch === "`") {
            i = Math.max(i, scanQuoted(source, i, ch) - 1);
            continue;
        }
        if (ch === "<")
            angle++;
        else if (ch === ">") {
            angle--;
            if (angle <= 0)
                return nextNonWhitespaceRight(source, i + 1) === "`";
        }
    }
    return false;
}
function scanQuoted(source, start, quote) {
    let escaped = false;
    for (let i = start + 1; i < source.length; i++) {
        const ch = source[i] ?? "";
        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === "\\") {
            escaped = true;
            continue;
        }
        if (ch === quote)
            return i + 1;
    }
    return source.length;
}
function applyTemplateLiteralOverlays(source, base, tokens, contentLanguage, options, predicate = () => true) {
    const templates = findTemplateLiteralRanges(source, base, tokens).filter((template) => template.expressions.length > 0 && predicate(template.start));
    if (templates.length === 0)
        return;
    const kept = tokens.filter((token) => !templates.some((template) => rangesOverlap(token.s, token.e, base + template.start, base + template.end)));
    tokens.length = 0;
    tokens.push(...kept);
    for (const template of templates)
        pushTemplateLiteralTokens(source, base, tokens, template, contentLanguage, options);
}
function pushTemplateLiteralTokens(source, base, tokens, template, contentLanguage, options) {
    pushRange(tokens, base + template.start, base + template.start + 1, "p");
    let cursor = template.contentStart;
    for (const expression of template.expressions) {
        pushTemplateContentTokens(source, base, tokens, cursor, expression.openStart, contentLanguage, options);
        pushRange(tokens, base + expression.openStart, base + expression.exprStart, "p");
        pushTemplateExpressionTokens(source, base, tokens, expression.exprStart, expression.exprEnd, options);
        if (expression.closeEnd > expression.exprEnd)
            pushRange(tokens, base + expression.exprEnd, base + expression.closeEnd, "p");
        cursor = expression.closeEnd;
    }
    pushTemplateContentTokens(source, base, tokens, cursor, template.contentEnd, contentLanguage, options);
    if (template.end > template.contentEnd)
        pushRange(tokens, base + template.end - 1, base + template.end, "p");
}
function pushTemplateContentTokens(source, base, tokens, start, end, contentLanguage, options) {
    if (end <= start)
        return;
    if (contentLanguage === "sql") {
        tokenizePatternRanges(source.slice(start, end), base + start, "sql", (s, e, c, bg, fg) => pushRange(tokens, s, e, c, bg, fg), options);
        return;
    }
    pushRange(tokens, base + start, base + end, "s", undefined, colorForTypes(["template-string"], options.resolveForeground));
}
function pushTemplateExpressionTokens(source, base, tokens, start, end, options) {
    if (end <= start)
        return;
    const expressionTokens = tokenizePatternRangeTokens(source.slice(start, end), base + start, "typescript", options);
    applyDefaultIdentifierOverlays(source.slice(start, end), base + start, expressionTokens, options.resolveForeground);
    tokens.push(...expressionTokens);
}
function applyDefaultIdentifierOverlays(source, base, tokens, resolveForeground) {
    const identRe = /[$_\p{ID_Start}][$_\u200c\u200d\p{ID_Continue}]*/gu;
    for (const match of source.matchAll(identRe)) {
        const text = match[0];
        const start = base + (match.index ?? 0);
        const end = start + text.length;
        if (hasTokenCovering(tokens, start, end))
            continue;
        pushRange(tokens, start, end, "d", undefined, colorForTypes(["variable"], resolveForeground));
    }
}
function findTemplateLiteralRanges(source, base, tokens) {
    const ranges = [];
    for (let i = 0; i < source.length;) {
        if (source[i] !== "`") {
            i++;
            continue;
        }
        const template = scanTemplateLiteral(source, i);
        if (hasExactTemplateToken(tokens, base + template.start, base + template.end))
            ranges.push(template);
        i = Math.max(i + 1, template.end);
    }
    return ranges;
}
function hasExactTemplateToken(tokens, start, end) {
    return tokens.some((token) => token.s === start && token.e === end && token.c === "s");
}
function scanTemplateLiteral(source, start) {
    const expressions = [];
    let escaped = false;
    for (let i = start + 1; i < source.length; i++) {
        const ch = source[i] ?? "";
        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === "\\") {
            escaped = true;
            continue;
        }
        if (ch === "`") {
            return { start, end: i + 1, contentStart: start + 1, contentEnd: i, expressions };
        }
        if (ch === "$" && source[i + 1] === "{") {
            const exprStart = i + 2;
            const exprEnd = scanTemplateExpression(source, exprStart);
            const closeEnd = exprEnd < source.length ? exprEnd + 1 : exprEnd;
            expressions.push({ openStart: i, exprStart, exprEnd, closeEnd });
            i = Math.max(i + 1, closeEnd - 1);
        }
    }
    return { start, end: source.length, contentStart: start + 1, contentEnd: source.length, expressions };
}
function scanTemplateExpression(source, start) {
    let depth = 1;
    for (let i = start; i < source.length; i++) {
        const ch = source[i] ?? "";
        if (ch === "\"" || ch === "'") {
            i = Math.max(i, scanQuoted(source, i, ch) - 1);
            continue;
        }
        if (ch === "`") {
            i = Math.max(i, scanTemplateLiteral(source, i).end - 1);
            continue;
        }
        if (ch === "/" && source[i + 1] === "/") {
            const next = source.indexOf("\n", i + 2);
            i = next < 0 ? source.length : next;
            continue;
        }
        if (ch === "/" && source[i + 1] === "*") {
            const next = source.indexOf("*/", i + 2);
            i = next < 0 ? source.length : next + 1;
            continue;
        }
        if (ch === "{")
            depth++;
        else if (ch === "}") {
            depth--;
            if (depth === 0)
                return i;
        }
    }
    return source.length;
}
function nextNonWhitespaceRight(source, start) {
    return source[skipWhitespaceRight(source, start)] ?? "";
}
function skipWhitespaceRight(source, start) {
    let i = start;
    while (i < source.length && /\s/.test(source[i] ?? ""))
        i++;
    return i;
}
function applySqlTemplateOverlays(base, lines, options) {
    const source = lines.join("\n");
    const templates = findSqlTemplateRanges(source);
    if (templates.length === 0)
        return base;
    const offsets = lineOffsets(lines);
    const tokens = [];
    for (let lineIndex = 0; lineIndex < base.length; lineIndex++) {
        const lineStart = offsets[lineIndex] ?? 0;
        for (const token of base[lineIndex] ?? []) {
            const abs = {
                s: lineStart + token.s,
                e: lineStart + token.e,
                c: token.c,
            };
            if (token.fg !== undefined)
                abs.fg = token.fg;
            if (token.bg !== undefined)
                abs.bg = token.bg;
            if (!templates.some((template) => rangesOverlap(abs.s, abs.e, template.start, template.end)))
                tokens.push(abs);
        }
    }
    for (const template of templates) {
        pushTemplateLiteralTokens(source, 0, tokens, template, "sql", options);
    }
    return distributeRangeTokens(tokens, lines);
}
function findSqlTemplateRanges(source) {
    const ranges = [];
    let i = 0;
    while (i < source.length) {
        if (source[i] !== "`") {
            i++;
            continue;
        }
        const template = scanTemplateLiteral(source, i);
        if (isSqlTaggedTemplateStart(source, i)) {
            ranges.push(template);
        }
        i = Math.max(i + 1, template.end);
    }
    return ranges;
}
function isSqlTaggedTemplateStart(source, templateStart) {
    let i = skipWhitespaceLeft(source, templateStart - 1);
    if (source[i] === ">")
        i = skipTypeArgumentsLeft(source, i);
    i = skipWhitespaceLeft(source, i);
    const end = i + 1;
    while (i >= 0 && /[$_\p{ID_Continue}]/u.test(source[i] ?? ""))
        i--;
    const ident = source.slice(i + 1, end);
    return ident.toLowerCase() === "sql";
}
function skipTypeArgumentsLeft(source, start) {
    let angle = 0;
    let brace = 0;
    let bracket = 0;
    let paren = 0;
    for (let i = start; i >= 0; i--) {
        const ch = source[i] ?? "";
        if (ch === ">")
            angle++;
        else if (ch === "<") {
            angle--;
            if (angle <= 0 && brace === 0 && bracket === 0 && paren === 0)
                return i - 1;
        }
        else if (ch === "}")
            brace++;
        else if (ch === "{")
            brace = Math.max(0, brace - 1);
        else if (ch === "]")
            bracket++;
        else if (ch === "[")
            bracket = Math.max(0, bracket - 1);
        else if (ch === ")")
            paren++;
        else if (ch === "(")
            paren = Math.max(0, paren - 1);
    }
    return start;
}
function skipWhitespaceLeft(source, start) {
    let i = start;
    while (i >= 0 && /\s/.test(source[i] ?? ""))
        i--;
    return i;
}
function lineOffsets(lines) {
    const offsets = new Array(lines.length + 1);
    offsets[0] = 0;
    for (let i = 0; i < lines.length; i++)
        offsets[i + 1] = offsets[i] + (lines[i]?.length ?? 0) + 1;
    return offsets;
}
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}
function isHtmlPath(path) {
    if (path === undefined)
        return false;
    const clean = path.split("?")[0]?.split("#")[0] ?? path;
    return clean.endsWith(".html") || clean.endsWith(".htm");
}
function isCssPath(path) {
    if (path === undefined)
        return false;
    const clean = path.split("?")[0]?.split("#")[0] ?? path;
    return clean.endsWith(".css");
}
function isXmlPath(path) {
    if (path === undefined)
        return false;
    const clean = path.split("?")[0]?.split("#")[0] ?? path;
    return clean.endsWith(".xml") || clean.endsWith(".svg");
}
function isSqlitePath(path) {
    if (path === undefined)
        return false;
    const clean = path.split("?")[0]?.split("#")[0] ?? path;
    return clean.endsWith(".sql") || clean.endsWith(".sqlite");
}
function isJsonPath(path) {
    if (path === undefined)
        return false;
    const clean = path.split("?")[0]?.split("#")[0] ?? path;
    return clean.endsWith(".json");
}
function tokenizeMarkdownLine(line) {
    const tokens = [];
    const heading = /^( {0,3})(#{1,6})(?:[ \t]+(.+))?$/.exec(line);
    if (heading !== null) {
        const markerStart = heading[1].length;
        const markerEnd = markerStart + heading[2].length;
        pushRange(tokens, markerStart, markerEnd, "p");
        if (heading[3] !== undefined) {
            const textStart = line.indexOf(heading[3], markerEnd);
            pushRange(tokens, textStart, line.length, "t");
        }
        return tokens;
    }
    if (/^ {0,3}(?:[-*_][ \t]*){3,}$/.test(line)) {
        pushRange(tokens, line.search(/[-*_]/), line.length, "p");
        return tokens;
    }
    const quote = /^( {0,3}>)(?:[ \t]+|$)/.exec(line);
    if (quote !== null)
        pushRange(tokens, quote[1].length - 1, quote[1].length, "p");
    const list = /^( {0,3})(?:(?:[-+*])|(?:\d{1,9}[.)]))(?=[ \t])/.exec(line);
    if (list !== null)
        pushRange(tokens, list[1].length, list[0].length, "p");
    pushMarkdownInlineCode(tokens, line);
    pushMarkdownLinks(tokens, line);
    pushMarkdownEmphasis(tokens, line);
    return tokens.sort(compareRangeTokens);
}
function tokenizeMarkdownFenceLine(line, fence) {
    const tokens = [];
    pushRange(tokens, fence.markerStart, fence.markerEnd, "p");
    if (fence.infoEnd > fence.infoStart)
        pushRange(tokens, fence.infoStart, fence.infoEnd, "t");
    return tokens;
}
function tokenizeMarkdownFenceContent(lines, info, options) {
    const language = markdownFenceLanguage(info);
    if (language === "typescript")
        return tokenizeTypeScriptPattern(lines, options);
    if (language === "html")
        return tokenizeHtmlPattern(lines, options);
    if (language === "css")
        return tokenizePattern(lines, "css", options);
    if (language === "xml")
        return tokenizeXmlPattern(lines, options);
    if (language === "json")
        return tokenizeJsonPattern(lines, options);
    if (language === "sql")
        return tokenizeSqlitePattern(lines, options);
    return lines.map(() => []);
}
function markdownFenceOpen(line) {
    let i = 0;
    while (i < line.length && i < 4 && line[i] === " ")
        i++;
    if (i > 3)
        return null;
    const marker = line[i];
    if (marker !== "`" && marker !== "~")
        return null;
    let markerEnd = i;
    while (markerEnd < line.length && line[markerEnd] === marker)
        markerEnd++;
    const length = markerEnd - i;
    if (length < 3)
        return null;
    let infoStart = markerEnd;
    while (infoStart < line.length && /\s/.test(line[infoStart] ?? ""))
        infoStart++;
    let infoEnd = infoStart;
    while (infoEnd < line.length && !/\s/.test(line[infoEnd] ?? ""))
        infoEnd++;
    return {
        marker,
        length,
        markerStart: i,
        markerEnd,
        info: line.slice(infoStart, infoEnd),
        infoStart,
        infoEnd,
    };
}
function markdownFenceClose(line, fence) {
    let i = 0;
    while (i < line.length && i < 4 && line[i] === " ")
        i++;
    if (i > 3)
        return false;
    let markerEnd = i;
    while (markerEnd < line.length && line[markerEnd] === fence.marker)
        markerEnd++;
    if (markerEnd - i < fence.length)
        return false;
    return line.slice(markerEnd).trim().length === 0;
}
function markdownFenceLanguage(info) {
    const language = info.trim().toLowerCase().replace(/^language-/, "");
    if (["ts", "tsx", "js", "jsx", "javascript", "typescript"].includes(language))
        return "typescript";
    if (["html", "htm"].includes(language))
        return "html";
    if (language === "css")
        return "css";
    if (["xml", "svg"].includes(language))
        return "xml";
    if (language === "json" || language === "jsonc")
        return "json";
    if (language === "sql" || language === "sqlite")
        return "sql";
    return "plaintext";
}
function pushMarkdownInlineCode(tokens, line) {
    const re = /`+[^`\n]*`+/g;
    for (const match of line.matchAll(re)) {
        const start = match.index ?? 0;
        pushRange(tokens, start, start + match[0].length, "s");
    }
}
function pushMarkdownLinks(tokens, line) {
    const re = /!?\[([^\]\n]+)\]\(([^)\n]+)\)/g;
    for (const match of line.matchAll(re)) {
        const whole = match[0];
        const text = match[1];
        const url = match[2];
        if (text === undefined || url === undefined)
            continue;
        const start = match.index ?? 0;
        if (rangeOverlapsTokens(tokens, start, start + whole.length))
            continue;
        const textStart = start + whole.indexOf(text);
        const urlStart = start + whole.lastIndexOf(url);
        pushRange(tokens, start, textStart, "p");
        pushRange(tokens, textStart, textStart + text.length, "t");
        pushRange(tokens, textStart + text.length, urlStart, "p");
        pushRange(tokens, urlStart, urlStart + url.length, "s");
        pushRange(tokens, urlStart + url.length, start + whole.length, "p");
    }
}
function pushMarkdownEmphasis(tokens, line) {
    const re = /(\*\*|__)(?=\S)(.+?\S)\1|(\*|_)(?=\S)(.+?\S)\3/g;
    for (const match of line.matchAll(re)) {
        const start = match.index ?? 0;
        const end = start + match[0].length;
        if (rangeOverlapsTokens(tokens, start, end))
            continue;
        const marker = match[1] ?? match[3];
        const text = match[2] ?? match[4];
        if (marker === undefined || text === undefined)
            continue;
        pushRange(tokens, start, start + marker.length, "p");
        pushRange(tokens, start + marker.length, end - marker.length, "k");
        pushRange(tokens, end - marker.length, end, "p");
    }
}
function rangeOverlapsTokens(tokens, start, end) {
    return tokens.some((token) => rangesOverlap(start, end, token.s, token.e));
}
function isMarkdownPath(path) {
    if (path === undefined)
        return false;
    const clean = path.split("?")[0]?.split("#")[0] ?? path;
    return clean.endsWith(".md") || clean.endsWith(".markdown");
}
//# sourceMappingURL=pattern-highlighter.js.map