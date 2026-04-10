/** Pick one item at random using integer weights (must sum > 0). */
export function pickWeighted<T extends { weight: number }>(items: T[]): T {
  if (!items.length) {
    throw new Error('pickWeighted: empty list');
  }
  const total = items.reduce((s, i) => s + Math.max(0, i.weight), 0);
  if (total <= 0) {
    return items[0];
  }
  let r = Math.random() * total;
  for (const item of items) {
    r -= Math.max(0, item.weight);
    if (r <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
}
