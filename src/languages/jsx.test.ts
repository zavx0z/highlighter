import {describe, expect, test} from "bun:test"
import {resolveLanguageHighlighter, tokenize} from "../highlighter.ts"
import type {Tokens} from "../tokens.ts"

const options = {languageId: "tsx", resolveForeground: (scopes: readonly string[]) => scopes[0]}
function spans(source: string, tokens = tokenize(source, options)) {
  return source.split("\n").flatMap((line, index) => tokens[index]!.map(token => ({
    text: line.slice(token.s, token.e), scope: token.fg, category: token.c,
  })))
}
function tags(source: string) {
  return spans(source).filter(token => token.scope === "entity.name.tag").map(token => token.text)
}
function validRanges(source: string, tokens: Tokens) {
  for (const [index, line] of source.split("\n").entries()) {
    let end = 0
    for (const token of tokens[index]!) {
      expect(token.s).toBeGreaterThanOrEqual(end)
      expect(token.e).toBeGreaterThan(token.s)
      expect(token.e).toBeLessThanOrEqual(line.length)
      end = token.s
    }
  }
}

describe("JSX / TSX", () => {
  test("регистрация идентификаторов, aliases и расширений", () => {
    for (const [id, alias] of [["jsx", "javascriptreact"], ["tsx", "typescriptreact"]] as const) {
      expect(resolveLanguageHighlighter({languageId: id}).id).toBe(id!)
      expect(resolveLanguageHighlighter({languageId: alias}).id).toBe(id!)
      expect(resolveLanguageHighlighter({path: `src/component.${id}?raw`}).id).toBe(id!)
    }
  })

  test("многострочный пример Inspector: компоненты, props и вложенный объект", () => {
    const source = `import {Tab} from "@immersive-ui/component/surfaces/tab"
<Tab
  label={null}
  position={{
    "edge": "right",
    "offset": 0.5
  }}
>
  <Button label="Инструменты" />
</Tab>`
    expect(tags(source)).toEqual(["Tab", "Button", "Tab"])
    const result = spans(source)
    expect(result.filter(token => token.scope === "entity.other.attribute-name").map(token => token.text))
      .toEqual(["label", "position", "label"])
    expect(result).toContainEqual({text: "null", scope: "keyword", category: "k"})
    expect(result).toContainEqual({text: "0.5", scope: "constant.numeric", category: "n"})
    expect(result.some(token => token.text === '"Инструменты"' && token.scope === "string")).toBe(true)
    validRanges(source, tokenize(source, options))
  })

  test("фрагменты, member tags, custom tags, spread и вложенные JSX expressions", () => {
    const source = `<><UI.Button disabled {...props} onClick={() => call({deep: {value: 1}})} />
<my-panel data-title="a > b">{items.map(item => <span>{item.name}</span>)}</my-panel></>`
    expect(tags(source)).toEqual(["UI.Button", "my-panel", "span", "span", "my-panel"])
    expect(spans(source).some(token => token.text === "call" && token.category === "f")).toBe(true)
    validRanges(source, tokenize(source, options))
  })

  test("JSX-текст не становится ключевыми словами, строками или комментариями", () => {
    const source = `<div>return true 42 // text "hello" 😀 &amp;
<Button /> next</div>; const after = 7`
    expect(tags(source)).toEqual(["div", "Button", "div"])
    const text = spans(source).filter(token => token.scope === "text.html").map(token => token.text).join("")
    expect(text).toContain('return true 42 // text "hello" 😀 &amp;')
    expect(spans(source).some(token => token.text === "const" && token.category === "k")).toBe(true)
    validRanges(source, tokenize(source, options))
  })

  test("строки, комментарии, regex и template text не содержат JSX-тегов", () => {
    const source = 'const a = "<Fake/>"; /* <No/> */ const b = /<Regex\\/>/; const t = `<Text/> ${ok ? <Real/> : null}`; // <End/>'
    expect(tags(source)).toEqual(["Real"])
    validRanges(source, tokenize(source, options))
  })

  test("скобки в строках, regex и templates не завершают JSX expression", () => {
    const source = '<Box value={{a: "}", b: /[{}]/, c: `x${call({d: 1})}`}}>{/* } */ ok ? <Yes/> : <No/>}</Box>'
    expect(tags(source)).toEqual(["Box", "Yes", "No", "Box"])
    validRanges(source, tokenize(source, options))
  })

  test("generics и сравнения сохраняют TypeScript-подсветку", () => {
    const source = 'const f = <T,>(x: T) => x; const a: Array<string> = []; const b = call<T>(x); const c = a < b && b > c'
    expect(tags(source)).toEqual([])
    expect(tokenize(source, options)).toEqual(tokenize(source, {...options, languageId: "typescript"}))
    expect(tags('const f = <T extends Item>(x: T) => <Box value={x} />')).toEqual(["Box"])
  })

  test("незавершённый ввод сохраняет корректные offsets и строки", () => {
    for (const source of ['<Box value={', '<><Box />', '<Box value="abc', '<Box><Wrong></Box>']) {
      const tokens = tokenize(source, options)
      expect(tokens).toHaveLength(source.split("\n").length)
      validRanges(source, tokens)
    }
  })

  test("JSX/TSX fences и отсутствие темы", () => {
    const source = '<Button label="😀" />'
    expect(tokenize(source, {languageId: "tsx"}).flat().every(token => token.fg === undefined)).toBe(true)
    for (const language of ["jsx", "tsx", "typescriptreact", "javascriptreact"]) {
      const markdown = `\`\`\`${language}\n${source}\n\`\`\``
      expect(spans(markdown, tokenize(markdown, {...options, languageId: "markdown"}))
        .filter(token => token.scope === "entity.name.tag").map(token => token.text)).toEqual(["Button"])
    }
  })
})
