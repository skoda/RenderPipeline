export class VectorOld {
  x: number
  y: number
  z: number

  private constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  static withXYZ(x: number, y: number, z: number) {
    return new VectorOld(x, y, z)
  }

  static add(l: VectorOld, r: VectorOld) {
    return l.clone().add(r)
  }

  static dot(l: VectorOld, r: VectorOld) {
    return l.x * r.x + l.y * r.y + l.z * r.z
  }

  static cross(l: VectorOld, r: VectorOld) {
    return VectorOld.withXYZ(l.y * r.z - l.z * r.y, l.z * r.x - l.x * r.z, l.x * r.y - l.y * r.x)
  }

  clone() {
    return VectorOld.withXYZ(this.x, this.y, this.z)
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

  add(color: VectorOld) {
    this.x += color.x
    this.y += color.y
    this.z += color.z
    return this
  }

  get lengthSquared() {
    return VectorOld.dot(this, this)
  }

  get length() {
    return Math.sqrt(this.lengthSquared)
  }
}
