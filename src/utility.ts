export const clamp = (n: number, max: number, min = 0) => Math.min(Math.max(n, min), max)

export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V? P: never]: any
}
