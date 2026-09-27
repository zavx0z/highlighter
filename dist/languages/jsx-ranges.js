import { pushRange } from "./range-tokens.js";
const namePattern = /[$_\p{ID_Start}][$_\p{ID_Continue}.:-]*/uy;
const identifierPattern = /[$_\p{ID_Start}][$_\p{ID_Continue}]*/uy;
const expressionKeywords = new Set(["return", "yield", "throw", "case", "delete", "void", "typeof", "new", "await", "in", "of", "instanceof"]);
/** Возвращает только JSX-разметку; выражения остаются исходным JavaScript. */
export function jsxRanges(source, options) {
    const ranges = [];
    const emit = (s, e, c, scope) => pushRange(ranges, s, e, c, undefined, options.resolveForeground?.([scope]));
    const nameAt = (index, pattern = namePattern) => {
        pattern.lastIndex = index;
        return pattern.exec(source)?.[0] ?? "";
    };
    const space = (index) => {
        while (index < source.length && /\s/u.test(source[index]))
            index++;
        return index;
    };
    const quoted = (index) => {
        const quote = source[index++];
        while (index < source.length) {
            if (source[index] === "\\")
                index += 2;
            else if (source[index++] === quote)
                break;
        }
        return Math.min(index, source.length);
    };
    function template(index) {
        index++;
        while (index < source.length) {
            if (source[index] === "\\")
                index += 2;
            else if (source[index] === "`")
                return index + 1;
            else if (source.startsWith("${", index))
                index = code(index + 2, true);
            else
                index++;
        }
        return source.length;
    }
    function code(index, brace = false) {
        let depth = 0;
        let expression = true;
        while (index < source.length) {
            const char = source[index];
            if (/\s/u.test(char)) {
                if (char === "\n" || char === "\r")
                    expression = true;
                index++;
                continue;
            }
            if (source.startsWith("//", index)) {
                const end = source.indexOf("\n", index + 2);
                index = end < 0 ? source.length : end;
                continue;
            }
            if (source.startsWith("/*", index)) {
                const end = source.indexOf("*/", index + 2);
                index = end < 0 ? source.length : end + 2;
                continue;
            }
            if (char === "\"" || char === "'") {
                index = quoted(index);
                expression = false;
                continue;
            }
            if (char === "`") {
                index = template(index);
                expression = false;
                continue;
            }
            if (char === "/" && expression) {
                let end = index + 1;
                let characterClass = false;
                while (end < source.length && !/[\r\n]/u.test(source[end])) {
                    const current = source[end++];
                    if (current === "\\")
                        end++;
                    else if (current === "[")
                        characterClass = true;
                    else if (current === "]")
                        characterClass = false;
                    else if (current === "/" && !characterClass)
                        break;
                }
                index = end;
                expression = false;
                continue;
            }
            if (char === "<" && expression) {
                const checkpoint = ranges.length;
                const end = element(index);
                if (end !== null) {
                    index = end;
                    expression = false;
                    continue;
                }
                ranges.length = checkpoint;
            }
            const identifier = nameAt(index, identifierPattern);
            if (identifier) {
                index += identifier.length;
                expression = expressionKeywords.has(identifier);
                continue;
            }
            if (char === "{")
                depth++;
            if (char === "}") {
                if (brace && depth === 0)
                    return index + 1;
                depth--;
            }
            expression = /[=(:,;!?&|+*%~^\[{}>\/-]/u.test(char);
            index++;
        }
        return index;
    }
    function element(start) {
        const name = nameAt(start + 1);
        if (!name && source[start + 1] !== ">")
            return null;
        let index = start + 1 + name.length;
        emit(start, start + 1, "p", "punctuation.definition.tag");
        emit(start + 1, index, "t", "entity.name.tag");
        while (index < source.length) {
            const beforeSpace = index;
            index = space(index);
            if (source.startsWith("/>", index)) {
                emit(index, index + 2, "p", "punctuation.definition.tag");
                return index + 2;
            }
            if (source[index] === ">") {
                emit(index, index + 1, "p", "punctuation.definition.tag");
                index++;
                break;
            }
            if (index === beforeSpace || !name)
                return null;
            if (source[index] === "{") {
                index = code(index + 1, true);
                continue;
            }
            const attribute = nameAt(index);
            if (!attribute)
                return null;
            emit(index, index + attribute.length, "t", "entity.other.attribute-name");
            index += attribute.length;
            const equals = space(index);
            if (source[equals] !== "=")
                continue;
            emit(equals, equals + 1, "p", "punctuation.separator");
            index = space(equals + 1);
            if (source[index] === "{")
                index = code(index + 1, true);
            else if (source[index] === "\"" || source[index] === "'") {
                const end = quoted(index);
                emit(index, end, "s", "string");
                index = end;
            }
            else
                return null;
        }
        while (index < source.length) {
            if (source.startsWith("</", index)) {
                const closing = nameAt(index + 2);
                const end = space(index + 2 + closing.length);
                if (closing !== name || source[end] !== ">")
                    return null;
                emit(index, index + 2, "p", "punctuation.definition.tag");
                emit(index + 2, index + 2 + closing.length, "t", "entity.name.tag");
                emit(end, end + 1, "p", "punctuation.definition.tag");
                return end + 1;
            }
            if (source[index] === "<") {
                const end = element(index);
                if (end === null)
                    return null;
                index = end;
            }
            else if (source[index] === "{")
                index = code(index + 1, true);
            else {
                const start = index;
                while (index < source.length && source[index] !== "<" && source[index] !== "{")
                    index++;
                emit(start, index, "d", "text.html");
            }
        }
        return null;
    }
    code(0);
    return ranges.sort((left, right) => left.s - right.s);
}
//# sourceMappingURL=jsx-ranges.js.map