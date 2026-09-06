import type {RangeToken} from "./range-tokens.ts"

export type TokenCoverage = (start: number, end: number) => boolean

/** Tests containment by one original token, not by a union of adjacent tokens. */
export function createTokenCoverage(tokens: readonly RangeToken[]): TokenCoverage {
  const sorted = [...tokens].sort((left, right) => left.s - right.s)
  const starts = new Float64Array(sorted.length)
  const ends = new Float64Array(sorted.length)
  let maximum = -Infinity
  for (let index = 0; index < sorted.length; index++) {
    starts[index] = sorted[index]!.s
    maximum = Math.max(maximum, sorted[index]!.e)
    ends[index] = maximum
  }
  return (start, end) => {
    let low = 0
    let high = starts.length
    while (low < high) {
      const middle = (low + high) >>> 1
      if (starts[middle]! <= start) low = middle + 1
      else high = middle
    }
    return low > 0 && ends[low - 1]! >= end
  }
}
