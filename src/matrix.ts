import Vector3 from './vector3'
import Vector4 from './vector4'

type MatrixIndex = 0 | 1 | 2 | 3

// 4x4 Transformation Matrix
export default class Matrix extends Array<Vector4> {
  private constructor(values: Vector4[]) {
    super(...values.map((v) => v.clone()))
    Object.seal(this)
  }

  clone() {
    return new Matrix([...this])
  }

  static withVectors(r1: Vector4, r2: Vector4, r3: Vector4, r4: Vector4) {
    return new Matrix([r1, r2, r3, r4])
  }

  static withValues(
    v11: number,
    v12: number,
    v13: number,
    v14: number,
    v21: number,
    v22: number,
    v23: number,
    v24: number,
    v31: number,
    v32: number,
    v33: number,
    v34: number,
    v41: number,
    v42: number,
    v43: number,
    v44: number
  ) {
    return Matrix.withVectors(
      Vector4.withXYZW(v11, v12, v13, v14),
      Vector4.withXYZW(v21, v22, v23, v24),
      Vector4.withXYZW(v31, v32, v33, v34),
      Vector4.withXYZW(v41, v42, v43, v44)
    )
  }

  static withIdentity() {
    return Matrix.translationWithVector(Vector3.withOrigin())
  }

  static scaleWithVector(scale: Vector3) {
    const [x, y, z] = scale
    return Matrix.scaleWithXYZ(x, y, z)
  }

  static scaleWithXYZ(x: number, y: number, z: number) {
    return Matrix.withVectors(
      Vector4.withXYZW(x, 0, 0, 0),
      Vector4.withXYZW(0, y, 0, 0),
      Vector4.withXYZW(0, 0, z, 0),
      Vector4.withXYZW(0, 0, 0, 1)
    )
  }

  static translationWithVector(translation: Vector3) {
    const [x, y, z] = translation
    return Matrix.translationWithXYZ(x, y, z)
  }

  static translationWithXYZ(x: number, y: number, z: number) {
    return Matrix.withVectors(
      Vector4.withXYZW(1, 0, 0, x),
      Vector4.withXYZW(0, 1, 0, y),
      Vector4.withXYZW(0, 0, 1, z),
      Vector4.withXYZW(0, 0, 0, 1)
    )
  }

  static rotationWithBasisVectors(i: Vector3, j: Vector3, k: Vector3) {
    return Matrix.withVectors(
      Vector4.withDirection(i.clone().normalize()),
      Vector4.withDirection(j.clone().normalize()),
      Vector4.withDirection(k.clone().normalize()),
      Vector4.withXYZW(0, 0, 0, 1)
    )
  }

  static rotationAroundAxis(axis: Vector3, radians: number) {
    const cost = Math.cos(radians)
    const mcos = 1.0 - cost
    const sint = Math.sin(radians)
    const av = axis.clone().normalize()

    return Matrix.rotationWithBasisVectors(
      Vector3.withXYZ(
        cost + mcos * av.x * av.x,
        mcos * av.x * av.y - sint * av.z,
        mcos * av.x * av.z + sint * av.y
      ),
      Vector3.withXYZ(
        mcos * av.x * av.y + sint * av.z,
        cost + mcos * av.y * av.y,
        mcos * av.y * av.z - sint * av.x
      ),
      Vector3.withXYZ(
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

    return Matrix.withVectors(
      Vector4.withXYZW(t, 0, 0, 0),
      Vector4.withXYZW(0, a * t, 0, 0),
      Vector4.withXYZW(0, 0, 1, 0),
      Vector4.withXYZW(0, 1, 0, 0)
    )
  }

  static multiply(l: Matrix, r: Matrix) {
    return l.clone().multiplyMatrix(r)
  }

  row(index: MatrixIndex) {
    return this[index]
  }

  column(col: MatrixIndex) {
    const [x, y, z, w] = [0, 1, 2, 3].map((row) => this[row][col], this)
    return Vector4.withXYZW(x, y, z, w)
  }

  multiplyMatrix(matrix: Matrix) {
    // Get right-hand side columns as vectors once
    const c0 = matrix.column(0)
    const c1 = matrix.column(1)
    const c2 = matrix.column(2)
    const c3 = matrix.column(3)
    this.forEach((r, i) => (this[i] = Vector4.withXYZW(r.dot(c0), r.dot(c1), r.dot(c2), r.dot(c3))))
    return this
  }

  multiplyVector(vector: Vector4) {
    return Vector3.withXYZ(this[0].dot(vector), this[1].dot(vector), this[2].dot(vector))
  }
}
