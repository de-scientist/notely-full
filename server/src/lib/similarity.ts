// simple cosine similarity between two number[] arrays
export function dot(a: number[], b: number[]) {
  return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
}

export function norm(a: number[]) {
  return Math.sqrt(a.reduce((s, v) => s + v * v, 0));
}

export function cosine(a: number[], b: number[]) {
  if (!a || !b || a.length === 0 || b.length === 0) return -1;
  return dot(a, b) / (norm(a) * norm(b));
}
