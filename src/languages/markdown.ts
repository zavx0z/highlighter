import type {EditorTokens, LanguageHighlighter, TokenizeOptions} from "../tokens.ts"
import {tokenizeMarkdownPattern} from "./pattern-highlighter.ts"

export function tokenizeMarkdown(lines: readonly string[], options: TokenizeOptions = {}): EditorTokens {
  return tokenizeMarkdownPattern(lines, options)
}

export const markdownHighlighter: LanguageHighlighter = {
  id: "markdown",
  name: "Markdown",
  extensions: ["md", "markdown"],
  aliases: ["md"],
  tokenize: tokenizeMarkdown,
}
