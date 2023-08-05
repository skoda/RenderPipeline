// Vector base class with generic methods for a number
// of vector-like types.
export default abstract class Vector extends Array<number> {
  constructor(values: number[]) {
    super(...values)
    Object.seal(this)
  }

  abstract clone(): Vector

  static add<T extends Vector>(l: T, r: T) {
    return l.clone().add(r)
  }

  static subtract<T extends Vector>(l: T, r: T) {
    return l.clone().subtract(r)
  }

  static multiply<T extends Vector>(l: T, r: T) {
    return l.clone().multiply(r)
  }

  static dot<T extends Vector>(l: T, r: T) {
    return l.dot(r)
  }

  each(fn: (i: number) => void) {
    for (const i of this.keys()) fn(i)
    return this
  }

  scale(s: number) {
    return this.each((i) => (this[i] *= s))
  }

  negate() {
    return this.scale(-1)
  }

  normalize(s = 1) {
    return this.scale(s / this.length)
  }

  sum() {
    return this.reduce((t, v) => t + v)
  }

  add(vector: this) {
    return this.each((i) => (this[i] += vector[i]))
  }

  subtract(vector: this) {
    return this.each((i) => (this[i] -= vector[i]))
  }

  multiply(vector: this) {
    return this.each((i) => (this[i] *= vector[i]))
  }

  dot(vector: this) {
    return this.clone().multiply(vector).sum()
  }

  get lengthSquared() {
    return this.dot(this)
  }

  get length() {
    return Math.sqrt(this.lengthSquared)
  }
}
