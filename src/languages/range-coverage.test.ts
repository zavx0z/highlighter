import {expect, test} from "bun:test"
import {createTokenCoverage} from "./range-coverage.ts"
import type {RangeToken} from "./range-tokens.ts"

test("indexed containment agrees with the original predicate for overlapping and adjacent ranges", () => {
  const tokens: RangeToken[] = [{s: 0, e: 5, c: "s"}, {s: 5, e: 10, c: "k"}, {s: 3, e: 8, c: "p"}, {s: 20, e: 100, c: "c"}]
  const covered = createTokenCoverage(tokens)
  for (let start = -1; start < 104; start++) for (let end = start; end < 104; end++) {
    expect(covered(start, end)).toBe(tokens.some(token => token.s <= start && token.e >= end))
  }
  expect(covered(0, 10)).toBe(false)
  expect(createTokenCoverage([])(0, 0)).toBe(false)
})

test("queries do not rescan source tokens and the snapshot does not mutate them", () => {
  let reads = 0
  const tokens = Array.from({length: 1000}, (_, index): RangeToken => ({
    get s() {
      reads++
      return index * 10
    },
    get e() {
      reads++
      return index * 10 + 8
    },
    c: "d",
  }))
  const covered = createTokenCoverage(tokens)
  reads = 0
  for (let index = 0; index < 1000; index++) {
    expect(covered(index * 10 + 1, index * 10 + 7)).toBe(true)
    expect(covered(index * 10 + 1, index * 10 + 9)).toBe(false)
  }
  expect(reads).toBe(0)
})
