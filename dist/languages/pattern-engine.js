export function tokenizePatternText(source, grammar) {
    return tokenizeSegments(source, grammar);
}
export function extendGrammar(base, additions) {
    return { ...base, ...additions };
}
export function insertBefore(grammar, before, insert) {
    const next = {};
    let inserted = false;
    for (const [key, value] of Object.entries(grammar)) {
        if (key === "rest")
            continue;
        if (key === before) {
            Object.assign(next, insert);
            inserted = true;
        }
        next[key] = value;
    }
    if (!inserted)
        Object.assign(next, insert);
    if (grammar.rest !== undefined)
        next.rest = grammar.rest;
    for (const key of Object.keys(grammar))
        delete grammar[key];
    Object.assign(grammar, next);
    return grammar;
}
function tokenizeSegments(source, grammar) {
    let segments = [source];
    for (const [type, value] of grammarEntries(grammar)) {
        const definitions = Array.isArray(value) ? value : [value];
        for (const definition of definitions) {
            segments = applyPattern(segments, type, normalizeDefinition(definition));
        }
    }
    return segments;
}
function grammarEntries(grammar) {
    const entries = [];
    for (const [key, value] of Object.entries(grammar)) {
        if (key === "rest" || value === undefined)
            continue;
        entries.push([key, value]);
    }
    if (grammar.rest !== undefined)
        entries.push(...grammarEntries(grammar.rest));
    return entries;
}
function normalizeDefinition(value) {
    return value instanceof RegExp ? { pattern: value } : value;
}
function applyPattern(segments, type, definition) {
    const out = [];
    for (const segment of segments) {
        if (typeof segment !== "string") {
            out.push(segment);
            continue;
        }
        out.push(...matchSegment(segment, type, definition));
    }
    return out;
}
function matchSegment(source, type, definition) {
    const re = toGlobalRegExp(definition.pattern);
    const out = [];
    let cursor = 0;
    let match;
    while ((match = re.exec(source)) !== null) {
        if (match[0].length === 0) {
            re.lastIndex++;
            continue;
        }
        let start = match.index;
        let text = match[0];
        if (definition.lookbehind === true && match[1] !== undefined) {
            start += match[1].length;
            text = text.slice(match[1].length);
        }
        const end = start + text.length;
        if (end <= cursor)
            continue;
        if (start > cursor)
            out.push(source.slice(cursor, start));
        const token = {
            type,
            content: definition.inside == null ? text : tokenizeSegments(text, definition.inside),
        };
        const aliases = normalizeAliases(definition.alias);
        if (aliases !== undefined)
            token.aliases = aliases;
        out.push(token);
        cursor = end;
    }
    if (cursor < source.length)
        out.push(source.slice(cursor));
    return out;
}
function toGlobalRegExp(re) {
    const flags = Array.from(new Set(`${re.flags.replace(/y/g, "")}g`.split(""))).join("");
    return new RegExp(re.source, flags);
}
function normalizeAliases(alias) {
    if (alias === undefined)
        return undefined;
    if (typeof alias === "string")
        return [alias];
    return alias;
}
//# sourceMappingURL=pattern-engine.js.map