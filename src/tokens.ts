export type TokenCategory = "k" | "s" | "n" | "c" | "t" | "f" | "p" | "d"

export type Token = {
  /** Start column, 0-based, inclusive. */
  s: number
  /** End column, 0-based, exclusive. */
  e: number
  /** Compact syntax category used by the consumer's theme. */
  c: TokenCategory | string
  /** Optional foreground resolved by `resolveForeground`. */
  fg?: string
  /** Optional color swatch/background hint. */
  bg?: string
}

export type Tokens = Token[][]
export type ResolveForeground = (scopes: readonly string[]) => string | undefined

export type TokenizeOptions = {
  resolveForeground?: ResolveForeground
}

export type Tokenize = (lines: readonly string[], options?: TokenizeOptions) => Tokens

export type LanguageHighlighter = {
  id: string
  name: string
  extensions?: readonly string[]
  aliases?: readonly string[]
  tokenize: Tokenize
}

/** Compatibility names for consumers that model tokens as editor rows. */
export type EditorToken = Token
export type EditorTokens = Tokens
export type EditorTokenize = Tokenize
