import type {LanguageHighlighter, TokenizeOptions, Tokens} from "../tokens.ts"
import {tokenizeHtmlPattern} from "./pattern-highlighter.ts"

export function tokenizeHtml(lines: readonly string[], options: TokenizeOptions = {}): Tokens {
  return tokenizeHtmlPattern(lines, options)
}

export const htmlHighlighter: LanguageHighlighter = {
  id: "html",
  name: "HTML / CSS / JS / TS",
  extensions: ["html", "htm"],
  aliases: ["markup", "proposal"],
  tokenize: tokenizeHtml,
}
