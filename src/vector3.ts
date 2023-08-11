import clamp from './clamp'

export default class Vector3 {
  x: number
  y: number
  z: number

  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  clone() {
    return new Vector3(this.x, this.y, this.z)
  }

  static add(l: Vector3, r: Vector3) {
    return l.clone().add(r)
  }

  static subtract(l: Vector3, r: Vector3) {
    return l.clone().subtract(r)
  }

  static multiply(l: Vector3, r: Vector3) {
    return l.clone().multiply(r)
  }

  scale(s: number) {
    this.x *= s
    this.y *= s
    this.z *= s
    return this
  }

  negate() {
    this.x = -this.x
    this.y = -this.y
    this.z = -this.z
    return this
  }

  normalize(s = 1) {
    return this.scale(s / this.magnitude)
  }

  add(vector: Vector3) {
    this.x += vector.x
    this.y += vector.y
    this.z += vector.z
    return this
  }

  subtract(vector: Vector3) {
    this.x -= vector.x
    this.y -= vector.y
    this.z -= vector.z
    return this
  }

  multiply(vector: Vector3) {
    this.x *= vector.x
    this.y *= vector.y
    this.z *= vector.z
    return this
  }

  dot(vector: Vector3) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z
  }

  static cross(l: Vector3, r: Vector3) {
    return new Vector3(l.y * r.z - l.z * r.y, l.z * r.x - l.x * r.z, l.x * r.y - l.y * r.x)
  }

  clamp(max: number, min = 0) {
    this.x = clamp(this.x, max, min)
    this.y = clamp(this.y, max, min)
    this.z = clamp(this.z, max, min)
    return this
  }

  get magnitudeSquared() {
    return this.dot(this)
  }

  get magnitude() {
    return Math.sqrt(this.magnitudeSquared)
  }
}

// export default class Vector3 extends Vector {
//   get x() {
//     return this[0]
//   }
//   set x(x: number) {
//     this[0] = x
//   }

//   get y() {
//     return this[1]
//   }
//   set y(y: number) {
//     this[1] = y
//   }

//   get z() {
//     return this[2]
//   }
//   set z(z: number) {
//     this[2] = z
//   }

//   private constructor(values: number[]) {
//     super(values)
//   }

//   clone() {
//     return new Vector3([...this])
//   }

//   static withXYZ(x: number, y: number, z: number) {
//     return new Vector3([x, y, z])
//   }

//   static withOrigin() {
//     return new Vector3(Array(3).fill(0))
//   }

//   static cross(l: Vector3, r: Vector3) {
//     return Vector3.withXYZ(l.y * r.z - l.z * r.y, l.z * r.x - l.x * r.z, l.x * r.y - l.y * r.x)
//   }
// }
