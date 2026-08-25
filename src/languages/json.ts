import type {LanguageHighlighter, TokenizeOptions, Tokens} from "../tokens.ts"
import {tokenizeJsonPattern} from "./pattern-highlighter.ts"

export function tokenizeJson(lines: readonly string[], options: TokenizeOptions = {}): Tokens {
  return tokenizeJsonPattern(lines, options)
}

export const jsonHighlighter: LanguageHighlighter = {
  id: "json",
  name: "JSON",
  extensions: ["json"],
  aliases: ["json"],
  tokenize: tokenizeJson,
}
