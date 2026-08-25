import type {LanguageHighlighter, TokenizeOptions, Tokens} from "../tokens.ts"
import {tokenizeXmlPattern} from "./pattern-highlighter.ts"

export function tokenizeXml(lines: readonly string[], options: TokenizeOptions = {}): Tokens {
  return tokenizeXmlPattern(lines, options)
}

export const xmlHighlighter: LanguageHighlighter = {
  id: "xml",
  name: "XML / SVG",
  extensions: ["xml", "svg"],
  aliases: ["svg"],
  tokenize: tokenizeXml,
}
