export function pushRange(tokens, s, e, c, bg, fg) {
    if (e <= s)
        return;
    const token = { s, e, c };
    if (fg !== undefined)
        token.fg = fg;
    if (bg !== undefined)
        token.bg = bg;
    tokens.push(token);
}
export function distributeRangeTokens(tokens, lines) {
    const result = lines.map(() => []);
    const offsets = new Array(lines.length + 1);
    offsets[0] = 0;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        offsets[lineIndex + 1] = offsets[lineIndex] + (lines[lineIndex]?.length ?? 0) + 1;
    }
    for (const token of tokens) {
        let lineIndex = upperBound(offsets, token.s) - 1;
        if (lineIndex < 0)
            lineIndex = 0;
        let cursor = token.s;
        while (cursor < token.e && lineIndex < lines.length) {
            const lineStart = offsets[lineIndex];
            const lineLen = lines[lineIndex]?.length ?? 0;
            const lineEnd = lineStart + lineLen;
            const spanEnd = Math.min(token.e, lineEnd);
            const sCol = cursor - lineStart;
            const eCol = spanEnd - lineStart;
            if (eCol > sCol) {
                const distributedToken = { s: sCol, e: eCol, c: token.c };
                if (token.fg !== undefined)
                    distributedToken.fg = token.fg;
                if (token.bg !== undefined)
                    distributedToken.bg = token.bg;
                result[lineIndex].push(distributedToken);
            }
            cursor = spanEnd + 1;
            lineIndex++;
        }
    }
    return result;
}
function upperBound(arr, value) {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if ((arr[mid] ?? 0) <= value)
            lo = mid + 1;
        else
            hi = mid;
    }
    return lo;
}
//# sourceMappingURL=range-tokens.js.map