import { clamp } from './utility'
import Vector from './vector'

export class Color extends Vector {
  get r() {
    return this[0]
  }
  set r(r: number) {
    this[0] = r
  }

  get g() {
    return this[1]
  }
  set g(g: number) {
    this[1] = g
  }

  get b() {
    return this[2]
  }
  set b(b: number) {
    this[2] = b
  }

  private constructor(r: number, g: number, b: number) {
    super([r, g, b])
  }

  static withRGB(r: number, g: number, b: number) {
    return new Color(r, g, b)
  }

  static withValue(v: number) {
    return Color.withRGB(v, v, v)
  }

  static withBlack() {
    return Color.withValue(0)
  }

  static withWhite() {
    return Color.withValue(1)
  }

  static interpolate(a: Color, b: Color, t: number) {
    return Color.subtract(b, a).scale(t).add(a)
  }

  clone() {
    return Color.withRGB(this.r, this.g, this.b)
  }

  scale(v: number) {
    this.r *= v
    this.g *= v
    this.b *= v
    return this
  }

  negate() {
    return this.scale(-1)
  }

  set(color: Color) {
    this.r = color.r
    this.g = color.g
    this.b = color.b
    return this
  }

  add(color: Color) {
    this.r += color.r
    this.g += color.g
    this.b += color.b
    return this
  }

  subtract(color: Color) {
    this.r -= color.r
    this.g -= color.g
    this.b -= color.b
    return this
  }

  multiply(color: Color) {
    this.r *= color.r
    this.g *= color.g
    this.b *= color.b
    return this
  }

  clamp(max: number, min = 0) {
    this.r = clamp(this.r, max, min)
    this.g = clamp(this.g, max, min)
    this.b = clamp(this.b, max, min)
    return this
  }
}
