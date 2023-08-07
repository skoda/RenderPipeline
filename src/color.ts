import Vector from './vector'

export default class Color extends Vector {
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

  private constructor(values: number[]) {
    super(values)
  }

  clone() {
    return new Color(this)
  }

  static withRGB(r: number, g: number, b: number) {
    return new Color([r, g, b])
  }

  static withValue(v: number) {
    return new Color(Array(3).fill(v))
  }

  static withBlack() {
    return Color.withValue(0)
  }

  static withWhite() {
    return Color.withValue(1)
  }
}
