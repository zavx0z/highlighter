import type {EditorTokens, LanguageHighlighter, TokenizeOptions} from "../tokens.ts"
import {tokenizePatternRanges, tokenizeSqlitePattern} from "./pattern-highlighter.ts"

export function tokenizeSqlite(lines: readonly string[], options: TokenizeOptions = {}): EditorTokens {
  return tokenizeSqlitePattern(lines, options)
}

export {tokenizePatternRanges as tokenizeSqliteRanges}

export const sqliteHighlighter: LanguageHighlighter = {
  id: "sqlite",
  name: "SQLite",
  extensions: ["sql", "sqlite"],
  aliases: ["sql", "sqlite"],
  tokenize: tokenizeSqlite,
}
