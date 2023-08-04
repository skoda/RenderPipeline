export class Vector {
  x: number
  y: number
  z: number

  private constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  static withXYZ(x: number, y: number, z: number) {
    return new Vector(x, y, z)
  }

  static add(l: Vector, r: Vector) {
    return l.clone().add(r)
  }

  static dot(l: Vector, r: Vector) {
    return l.x * r.x + l.y * r.y + l.z * r.z
  }

  static cross(l: Vector, r: Vector) {
    return Vector.withXYZ(l.y * r.z - l.z * r.y, l.z * r.x - l.x * r.z, l.x * r.y - l.y * r.x)
  }

  clone() {
    return Vector.withXYZ(this.x, this.y, this.z)
  }

  scale(v: number) {
    this.x *= v
    this.y *= v
    this.z *= v
    return this
  }

  negate() {
    return this.scale(-1)
  }

  normalize() {
    return this.scale(1 / this.length)
  }

  add(color: Vector) {
    this.x += color.x
    this.y += color.y
    this.z += color.z
    return this
  }

  get lengthSquared() {
    return Vector.dot(this, this)
  }

  get length() {
    return Math.sqrt(this.lengthSquared)
  }
}
