import { clamp } from './clamp.js'
import { Vector3 } from './vector3.js'

export class Vector4 {
  x: number
  y: number
  z: number
  w: number

  constructor(x: number, y: number, z: number, w: number) {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }

  clone() {
    return new Vector4(this.x, this.y, this.z, this.w)
  }

  static withPosition(position: Vector3) {
    return new Vector4(position.x, position.y, position.z, 1)
  }

  static withDirection(direction: Vector3) {
    return new Vector4(direction.x, direction.y, direction.z, 0)
  }

  static add(l: Vector4, r: Vector4) {
    return l.clone().add(r)
  }

  static subtract(l: Vector4, r: Vector4) {
    return l.clone().subtract(r)
  }

  static multiply(l: Vector4, r: Vector4) {
    return l.clone().multiply(r)
  }

  scale(s: number) {
    this.x *= s
    this.y *= s
    this.z *= s
    this.w *= s
    return this
  }

  negate() {
    this.x = -this.x
    this.y = -this.y
    this.z = -this.z
    this.w = -this.w
    return this
  }

  normalize(s = 1) {
    return this.scale(s / this.magnitude)
  }

  add(vector: Vector4) {
    this.x += vector.x
    this.y += vector.y
    this.z += vector.z
    this.w += vector.w
    return this
  }

  subtract(vector: Vector4) {
    this.x -= vector.x
    this.y -= vector.y
    this.z -= vector.z
    this.w -= vector.w
    return this
  }

  multiply(vector: Vector4) {
    this.x *= vector.x
    this.y *= vector.y
    this.z *= vector.z
    this.w *= vector.w
    return this
  }

  dot(vector: Vector4) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z + this.w * vector.w
  }

  clamp(max: number, min = 0) {
    this.x = clamp(this.x, max, min)
    this.y = clamp(this.y, max, min)
    this.z = clamp(this.z, max, min)
    this.w = clamp(this.w, max, min)
    return this
  }

  get magnitudeSquared() {
    return this.dot(this)
  }

  get magnitude() {
    return Math.sqrt(this.magnitudeSquared)
  }
}
