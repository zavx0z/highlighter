import {cssHighlighter} from "./languages/css.ts"
import {htmlHighlighter} from "./languages/html.ts"
import {jsonHighlighter} from "./languages/json.ts"
import {markdownHighlighter} from "./languages/markdown.ts"
import {plaintextHighlighter} from "./languages/plaintext.ts"
import {sqliteHighlighter} from "./languages/sqlite.ts"
import {typescriptHighlighter} from "./languages/typescript.ts"
import {xmlHighlighter} from "./languages/xml.ts"
import type {LanguageHighlighter, TokenizeOptions, Tokens} from "./tokens.ts"

export type ResolveHighlighterOptions = {
  languageId?: string
  path?: string
  filename?: string
  fallbackLanguageId?: string
}

export type TokenizeSourceOptions = ResolveHighlighterOptions & TokenizeOptions

export type HighlighterRegistry = {
  register(highlighter: LanguageHighlighter): void
  list(): readonly LanguageHighlighter[]
  resolve(options?: ResolveHighlighterOptions): LanguageHighlighter
}

export const builtInLanguageHighlighters: readonly LanguageHighlighter[] = [
  plaintextHighlighter,
  markdownHighlighter,
  typescriptHighlighter,
  sqliteHighlighter,
  cssHighlighter,
  xmlHighlighter,
  htmlHighlighter,
  jsonHighlighter,
]

export function createHighlighterRegistry(
  initial: readonly LanguageHighlighter[] = builtInLanguageHighlighters,
): HighlighterRegistry {
  const registry = [...initial]

  return {
    register(highlighter): void {
      const index = registry.findIndex((item) => item.id === highlighter.id)
      if (index >= 0) registry[index] = highlighter
      else registry.push(highlighter)
    },
    list(): readonly LanguageHighlighter[] {
      return registry
    },
    resolve(options = {}): LanguageHighlighter {
      return resolveFromRegistry(registry, options)
    },
  }
}

export const defaultHighlighterRegistry = createHighlighterRegistry()

export function registerLanguageHighlighter(highlighter: LanguageHighlighter): void {
  defaultHighlighterRegistry.register(highlighter)
}

export function listLanguageHighlighters(): readonly LanguageHighlighter[] {
  return defaultHighlighterRegistry.list()
}

export function resolveLanguageHighlighter(options: ResolveHighlighterOptions = {}): LanguageHighlighter {
  return defaultHighlighterRegistry.resolve(options)
}

export function tokenizeLines(lines: readonly string[], options: TokenizeSourceOptions = {}): Tokens {
  const highlighter = resolveLanguageHighlighter(options)
  return highlighter.tokenize(lines, tokenizeOptions(options))
}

export function tokenize(source: string, options: TokenizeSourceOptions = {}): Tokens {
  return tokenizeLines(source.split("\n"), options)
}

function resolveFromRegistry(
  registry: readonly LanguageHighlighter[],
  options: ResolveHighlighterOptions,
): LanguageHighlighter {
  const languageId = options.languageId?.toLowerCase()
  const explicit = languageId === undefined ? undefined : byLanguageId(registry, languageId)
  if (explicit !== undefined) return explicit

  const extension = extensionOf(options.filename ?? options.path ?? "")
  const byExtension = extension.length === 0
    ? undefined
    : registry.find((item) => (item.extensions ?? []).some((candidate) => candidate.toLowerCase() === extension))
  if (byExtension !== undefined) return byExtension

  const fallbackId = options.fallbackLanguageId?.toLowerCase() ?? "plaintext"
  return byLanguageId(registry, fallbackId)
    ?? byLanguageId(registry, "plaintext")
    ?? registry[0]
    ?? plaintextHighlighter
}

function byLanguageId(
  registry: readonly LanguageHighlighter[],
  languageId: string,
): LanguageHighlighter | undefined {
  return registry.find((item) =>
    item.id.toLowerCase() === languageId ||
    (item.aliases ?? []).some((alias) => alias.toLowerCase() === languageId)
  )
}

function extensionOf(path: string): string {
  const withoutQuery = path.split("?")[0]?.split("#")[0] ?? path
  const slash = Math.max(withoutQuery.lastIndexOf("/"), withoutQuery.lastIndexOf("\\"))
  const file = withoutQuery.slice(slash + 1)
  const dot = file.lastIndexOf(".")
  if (dot < 0 || dot === file.length - 1) return ""
  return file.slice(dot + 1).toLowerCase()
}

function tokenizeOptions(options: TokenizeSourceOptions): TokenizeOptions {
  return options.resolveForeground === undefined
    ? {}
    : {resolveForeground: options.resolveForeground}
}
