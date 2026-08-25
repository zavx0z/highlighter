import type {LanguageHighlighter, Tokens} from "../tokens.ts"

export function tokenizePlaintext(lines: readonly string[]): Tokens {
  return lines.map(() => [])
}

export const plaintextHighlighter: LanguageHighlighter = {
  id: "plaintext",
  name: "Plain text",
  extensions: ["txt", "text"],
  aliases: ["plain", "text"],
  tokenize: tokenizePlaintext,
}
