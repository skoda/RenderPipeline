import Color from './color'
import Vector3 from './vector3'

export default class Light {
  pos: Vector3
  ambt: Color
  diff: Color
  spec: Color

  private constructor(pos: Vector3, ambt: Color, diff: Color, spec: Color) {
    this.pos = pos.clone()
    this.ambt = ambt.clone()
    this.diff = diff.clone()
    this.spec = spec.clone()
  }

  clone() {
    return this.withPositionAndColors(this.pos, this.ambt, this.diff, this.spec)
  }

  withPositionAndColors(position: Vector3, ambient: Color, diffuse: Color, specular: Color) {
    return new Light(position, ambient, diffuse, specular)
  }
}
