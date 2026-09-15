import {beforeAll, describe, expect, test} from "bun:test"
import {resolve} from "node:path"

let moduleUrl: string
beforeAll(async () => {
  const build = await Bun.build({entrypoints: [resolve(import.meta.dir, "json.ts")], target: "node", format: "esm"})
  if (!build.success) throw new Error(build.logs.map(log => log.message).join("\n"))
  moduleUrl = `data:text/javascript;base64,${Buffer.from(await build.outputs[0]!.text()).toString("base64")}`
})

describe.each([
  {name: "Переводы строк", source: JSON.stringify({source: "\n".repeat(64)})},
  {name: "Смешанные escape", source: JSON.stringify({source: '\\"/\n\t\r\b\f'.repeat(64)})},
  {name: "Unicode escape", source: '{"source":"' + "\\u0041".repeat(64) + '"}'},
])("V8: $name", ({source}) => {
  test("подсветка завершается и сохраняет границы ключа и полного строкового значения", async () => {
    const script = `
const {tokenizeJson} = await import(${JSON.stringify(moduleUrl)})
const source = ${JSON.stringify(source)}
const tokens = tokenizeJson([source])[0]
console.log(JSON.stringify({source, tokens}))
`
    const child = Bun.spawn(["node", "--input-type=module"], {
      stdin: new TextEncoder().encode(script), stdout: "pipe", stderr: "pipe", timeout: 3000,
    })
    const [exit, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    expect(exit, `V8 завершает подсветку без зависания: ${stderr}`).toBe(0)
    const result = JSON.parse(stdout) as {source: string, tokens: {s: number, e: number, c: string}[]}
    expect(result.source).toBe(source)
    expect(result.tokens.find(token => token.s === 1 && token.e === 9)?.c).toBe("t")
    expect(result.tokens.find(token => token.s === 10 && token.e === source.length - 1)?.c).toBe("s")
  })
})
