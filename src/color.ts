import { clamp } from './utility'

export class Color {
  r: number
  g: number
  b: number

  private constructor(r: number, g: number, b: number) {
    this.r = r
    this.g = g
    this.b = b
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

  static add(l: Color, r: Color) {
    return l.clone().add(r)
  }

  static subtract(l: Color, r: Color) {
    return l.clone().subtract(r)
  }

  static multiply(l: Color, r: Color) {
    return l.clone().multiply(r)
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
