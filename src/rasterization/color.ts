import { clamp } from '../math'

export class Color {
  r: number
  g: number
  b: number

  constructor(r: number, g: number, b: number) {
    this.r = r
    this.g = g
    this.b = b
  }

  clone() {
    return new Color(this.r, this.g, this.b)
  }

  static withValue(v: number) {
    return new Color(v, v, v)
  }

  static withWhite() {
    return this.withValue(1)
  }

  static withBlack() {
    return this.withValue(0)
  }

  static add(l: Color, r: Color) {
    return l.clone().add(r)
  }

  static subtract(l: Color, r: Color) {
    return l.clone().subtract(r)
  }

  static multiply(l: Color, r: Color) {
    return l.clone().multiply(r)
  }

  scale(s: number) {
    this.r *= s
    this.g *= s
    this.b *= s
    return this
  }

  negate() {
    this.r = -this.r
    this.g = -this.g
    this.b = -this.b
    return this
  }

  add(vector: Color) {
    this.r += vector.r
    this.g += vector.g
    this.b += vector.b
    return this
  }

  subtract(vector: Color) {
    this.r -= vector.r
    this.g -= vector.g
    this.b -= vector.b
    return this
  }

  multiply(vector: Color) {
    this.r *= vector.r
    this.g *= vector.g
    this.b *= vector.b
    return this
  }

  clamp(max: number, min = 0) {
    this.r = clamp(this.r, max, min)
    this.g = clamp(this.g, max, min)
    this.b = clamp(this.b, max, min)
    return this
  }
}
