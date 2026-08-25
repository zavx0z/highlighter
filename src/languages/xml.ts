import type {EditorTokens, LanguageHighlighter, TokenizeOptions} from "../tokens.ts"
import {tokenizeXmlPattern} from "./pattern-highlighter.ts"

export function tokenizeXml(lines: readonly string[], options: TokenizeOptions = {}): EditorTokens {
  return tokenizeXmlPattern(lines, options)
}

export const xmlHighlighter: LanguageHighlighter = {
  id: "xml",
  name: "XML / SVG",
  extensions: ["xml", "svg"],
  aliases: ["svg"],
  tokenize: tokenizeXml,
}
