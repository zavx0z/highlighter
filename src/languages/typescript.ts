import type {LanguageHighlighter, TokenizeOptions, Tokens} from "../tokens.ts"
import {tokenizeTypeScriptPattern} from "./pattern-highlighter.ts"

export function tokenizeTypeScript(lines: readonly string[], options: TokenizeOptions = {}): Tokens {
  return tokenizeTypeScriptPattern(lines, options)
}

export const typescriptHighlighter: LanguageHighlighter = {
  id: "typescript",
  name: "TypeScript / JavaScript",
  extensions: ["ts", "mts", "cts", "js", "mjs", "cjs"],
  aliases: ["ts", "js", "javascript"],
  tokenize: tokenizeTypeScript,
}
