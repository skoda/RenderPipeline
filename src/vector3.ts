import Vector from './vector'

export default class Vector3 extends Vector {
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

  get z() {
    return this[2]
  }
  set z(z: number) {
    this[2] = z
  }

  private constructor(values: number[]) {
    super(values)
  }

  clone() {
    return new Vector3(this)
  }

  static withXYZ(x: number, y: number, z: number) {
    return new Vector3([x, y, z])
  }

  static withOrigin() {
    return new Vector3(Array(3).fill(0))
  }

  static cross(l: Vector3, r: Vector3) {
    return Vector3.withXYZ(l.y * r.z - l.z * r.y, l.z * r.x - l.x * r.z, l.x * r.y - l.y * r.x)
  }
}
