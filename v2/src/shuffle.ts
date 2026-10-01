/**
 * Fisher-Yates shuffle: every ordering is equally likely.
 *
 * Worth doing properly rather than the common `sort(() => Math.random() - 0.5)`
 * trick, which is biased and leaves cards near where they started - exactly the
 * "getting used to the order" problem shuffling is meant to solve.
 */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
