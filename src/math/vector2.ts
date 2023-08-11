import { clamp } from './clamp'

export class Vector2 {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  clone() {
    return new Vector2(this.x, this.y)
  }

  static add(l: Vector2, r: Vector2) {
    return l.clone().add(r)
  }

  static subtract(l: Vector2, r: Vector2) {
    return l.clone().subtract(r)
  }

  static multiply(l: Vector2, r: Vector2) {
    return l.clone().multiply(r)
  }

  scale(s: number) {
    this.x *= s
    this.y *= s
    return this
  }

  negate() {
    this.x = -this.x
    this.y = -this.y
    return this
  }

  normalize(s = 1) {
    return this.scale(s / this.magnitude)
  }

  add(vector: Vector2) {
    this.x += vector.x
    this.y += vector.y
    return this
  }

  subtract(vector: Vector2) {
    this.x -= vector.x
    this.y -= vector.y
    return this
  }

  multiply(vector: Vector2) {
    this.x *= vector.x
    this.y *= vector.y
    return this
  }

  dot(vector: Vector2) {
    return this.x * vector.x + this.y * vector.y
  }

  clamp(max: number, min = 0) {
    this.x = clamp(this.x, max, min)
    this.y = clamp(this.y, max, min)
    return this
  }

  get magnitudeSquared() {
    return this.dot(this)
  }

  get magnitude() {
    return Math.sqrt(this.magnitudeSquared)
  }
}
