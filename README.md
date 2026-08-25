# @zavx0z/highlighter

Dependency-free syntax tokenizers for browser, Node.js, and Bun projects.
The package returns line-relative ranges and leaves rendering to the consumer.

## Install

```bash
npm install @zavx0z/highlighter
```

Version `0.1.0` is prepared for publication but is not published yet. During
local development the repository can be linked with Bun or installed by path.

## Tokenize source

```ts
import {tokenize} from "@zavx0z/highlighter"

const tokens = tokenize("const value = call(42)", {languageId: "typescript"})
// [[{s: 0, e: 5, c: "k"}, ...]]
```

Use `tokenizeLines(lines, options)` when the source is already split into lines.
Language resolution uses `languageId`, then `filename` or `path`, then
`fallbackLanguageId`. The package fallback is `plaintext`.

```ts
const tokens = tokenize(source, {path: "src/example.ts"})
```

Built-in languages are TypeScript/JavaScript, HTML, CSS, JSON, Markdown, XML,
SQLite/SQL, and plaintext. HTML supports embedded CSS and TypeScript, Markdown
supports fenced languages, and TypeScript supports SQL tagged templates.

## Token shape

```ts
type Token = {
  s: number       // inclusive 0-based column
  e: number       // exclusive 0-based column
  c: string       // compact syntax category
  fg?: string     // resolved foreground
  bg?: string     // color swatch/background hint
}
```

The standard categories are `k` keyword, `s` string, `n` number/constant,
`c` comment, `t` type/property, `f` function, `p` punctuation, and `d` default.

## Theme integration

Tokenization is theme-neutral by default. Pass `resolveForeground` to resolve
TextMate-like scopes without coupling the package to a particular theme.

```ts
const tokens = tokenize(source, {
  languageId: "typescript",
  resolveForeground(scopes) {
    return scopes.includes("keyword") ? "#ff7b72" : undefined
  },
})
```

## Registries

`defaultHighlighterRegistry` backs the convenience functions
`registerLanguageHighlighter`, `listLanguageHighlighters`, and
`resolveLanguageHighlighter`. Use `createHighlighterRegistry()` when a project
needs an isolated registry.
