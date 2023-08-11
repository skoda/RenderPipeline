import Vector3 from './vector3'
import Vector4 from './vector4'

type MatrixColumnIndex = 0 | 1 | 2 | 3

// 4x4 Transformation Matrix
export default class Matrix {
  r0: Vector4
  r1: Vector4
  r2: Vector4
  r3: Vector4

  constructor(r0: Vector4, r1: Vector4, r2: Vector4, r3: Vector4) {
    this.r0 = r0
    this.r1 = r1
    this.r2 = r2
    this.r3 = r3
  }

  clone() {
    return new Matrix(this.r0.clone(), this.r1.clone(), this.r2.clone(), this.r3.clone())
  }

  static withIdentity() {
    return Matrix.translationWithXYZ(0, 0, 0)
  }

  static scaleWithVector(scale: Vector3) {
    return Matrix.scaleWithXYZ(scale.x, scale.y, scale.z)
  }

  static scaleWithXYZ(x: number, y = 1, z = 1) {
    return new Matrix(
      new Vector4(x, 0, 0, 0),
      new Vector4(0, y, 0, 0),
      new Vector4(0, 0, z, 0),
      new Vector4(0, 0, 0, 1)
    )
  }

  static translationWithVector(translation: Vector3) {
    return Matrix.translationWithXYZ(translation.x, translation.y, translation.z)
  }

  static translationWithXYZ(x: number, y: number, z: number) {
    return new Matrix(
      new Vector4(1, 0, 0, x),
      new Vector4(0, 1, 0, y),
      new Vector4(0, 0, 1, z),
      new Vector4(0, 0, 0, 1)
    )
  }

  static rotationWithBasisVectors(i: Vector3, j: Vector3, k: Vector3) {
    return new Matrix(
      Vector4.withDirection(i.clone().normalize()),
      Vector4.withDirection(j.clone().normalize()),
      Vector4.withDirection(k.clone().normalize()),
      new Vector4(0, 0, 0, 1)
    )
  }

  static rotationAroundAxis(axis: Vector3, radians: number) {
    const cost = Math.cos(radians)
    const mcos = 1.0 - cost
    const sint = Math.sin(radians)
    const av = axis.clone().normalize()

    return Matrix.rotationWithBasisVectors(
      new Vector3(
        cost + mcos * av.x * av.x,
        mcos * av.x * av.y - sint * av.z,
        mcos * av.x * av.z + sint * av.y
      ),
      new Vector3(
        mcos * av.x * av.y + sint * av.z,
        cost + mcos * av.y * av.y,
        mcos * av.y * av.z - sint * av.x
      ),
      new Vector3(
        mcos * av.x * av.z - sint * av.y,
        mcos * av.y * av.z + sint * av.x,
        cost + mcos * av.z * av.z
      )
    )
  }

  static rotationWithLookDirection(look: Vector3, up: Vector3) {
    const i = Vector3.cross(look, up)
    return Matrix.rotationWithBasisVectors(i, look, Vector3.cross(i, look))
  }

  static projectionWithViewportAndFieldOfView(
    viewportWidth: number,
    viewportHeight: number,
    horizontalFieldOfView = Math.PI / 2.0
  ) {
    const t = 1.0 / Math.tan(horizontalFieldOfView / 2.0)
    const a = viewportWidth / viewportHeight

    return new Matrix(
      new Vector4(t, 0, 0, 0),
      new Vector4(0, a * t, 0, 0),
      new Vector4(0, 0, 1, 0),
      new Vector4(0, 1, 0, 0)
    )
  }

  static multiply(l: Matrix, r: Matrix) {
    return l.clone().multiplyMatrix(r)
  }

  column(col: MatrixColumnIndex) {
    switch (col) {
      case 0:
        return new Vector4(this.r0.x, this.r0.y, this.r0.z, this.r0.w)
      case 1:
        return new Vector4(this.r1.x, this.r1.y, this.r1.z, this.r1.w)
      case 2:
        return new Vector4(this.r2.x, this.r2.y, this.r2.z, this.r2.w)
      default:
        return new Vector4(this.r3.x, this.r3.y, this.r3.z, this.r3.w)
    }
  }

  multiplyMatrix(matrix: Matrix) {
    // Get right-hand side columns as vectors once
    const c0 = matrix.column(0)
    const c1 = matrix.column(1)
    const c2 = matrix.column(2)
    const c3 = matrix.column(3)
    this.r0 = new Vector4(this.r0.dot(c0), this.r0.dot(c1), this.r0.dot(c2), this.r0.dot(c3))
    this.r1 = new Vector4(this.r1.dot(c0), this.r1.dot(c1), this.r1.dot(c2), this.r1.dot(c3))
    this.r2 = new Vector4(this.r2.dot(c0), this.r2.dot(c1), this.r2.dot(c2), this.r2.dot(c3))
    this.r3 = new Vector4(this.r3.dot(c0), this.r3.dot(c1), this.r3.dot(c2), this.r3.dot(c3))
    return this
  }

  multiplyVector(vector: Vector4) {
    return new Vector3(this.r0.dot(vector), this.r1.dot(vector), this.r2.dot(vector))
  }
}
