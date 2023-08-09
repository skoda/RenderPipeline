import Vector from './vector'

export default class Vector2 extends Vector {
  get x() {
    return this[0]
  }
  set x(x: number) {
    this[0] = x
  }

  get y() {
    return this[1]
  }
  set y(y: number) {
    this[1] = y
  }

  private constructor(values: number[]) {
    super(values)
  }

  clone() {
    return new Vector2(this)
  }

  static withXY(x: number, y: number) {
    return new Vector2([x, y])
  }

  static withOrigin() {
    return new Vector2(Array(2).fill(0))
  }
}
