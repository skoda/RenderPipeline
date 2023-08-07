import Vector from './vector'
import Vector3 from './vector3'

export default class Vector4 extends Vector {
  private constructor(values: number[]) {
    super(values)
  }

  clone() {
    return new Vector4(this)
  }

  static withXYZW(x: number, y: number, z: number, w: number) {
    return new Vector4([x, y, z, w])
  }

  static withPosition(vector: Vector3) {
    return new Vector4([...vector, 1])
  }

  static withDirection(vector: Vector3) {
    return new Vector4([...vector, 0])
  }
}
