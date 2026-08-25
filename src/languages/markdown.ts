import type {LanguageHighlighter, TokenizeOptions, Tokens} from "../tokens.ts"
import {tokenizeMarkdownPattern} from "./pattern-highlighter.ts"

export function tokenizeMarkdown(lines: readonly string[], options: TokenizeOptions = {}): Tokens {
  return tokenizeMarkdownPattern(lines, options)
}

export const markdownHighlighter: LanguageHighlighter = {
  id: "markdown",
  name: "Markdown",
  extensions: ["md", "markdown"],
  aliases: ["md"],
  tokenize: tokenizeMarkdown,
}
