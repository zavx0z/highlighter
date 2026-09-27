import type {LanguageHighlighter, TokenizeOptions, Tokens} from "../tokens.ts"
import {tokenizeJsxPattern} from "./pattern-highlighter.ts"

/** JSX/TSX-разметка с TypeScript-подсветкой вложенных выражений. */
export function tokenizeJsx(lines: readonly string[], options: TokenizeOptions = {}): Tokens {
  return tokenizeJsxPattern(lines, options)
}

export const jsxHighlighter: LanguageHighlighter = {
  id: "jsx",
  name: "JavaScript JSX",
  extensions: ["jsx"],
  aliases: ["javascriptreact"],
  tokenize: tokenizeJsx,
}

export const tsxHighlighter: LanguageHighlighter = {
  id: "tsx",
  name: "TypeScript TSX",
  extensions: ["tsx"],
  aliases: ["typescriptreact"],
  tokenize: tokenizeJsx,
}
