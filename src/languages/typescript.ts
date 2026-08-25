import type {EditorTokens, LanguageHighlighter, TokenizeOptions} from "../tokens.ts"
import {tokenizeTypeScriptPattern} from "./pattern-highlighter.ts"

export function tokenizeTypeScript(lines: readonly string[], options: TokenizeOptions = {}): EditorTokens {
  return tokenizeTypeScriptPattern(lines, options)
}

export const typescriptHighlighter: LanguageHighlighter = {
  id: "typescript",
  name: "TypeScript / JavaScript",
  extensions: ["ts", "mts", "cts", "js", "mjs", "cjs"],
  aliases: ["ts", "js", "javascript"],
  tokenize: tokenizeTypeScript,
}
