import { Color } from './color'
import { Vector } from './vector'

export class Light {
  pos: Vector
  ambt: Color
  diff: Color
  spec: Color

  private constructor(pos: Vector, ambt: Color, diff: Color, spec: Color) {
    this.pos = pos.clone()
    this.ambt = ambt.clone()
    this.diff = diff.clone()
    this.spec = spec.clone()
  }

  withPositionAndColors(position: Vector, ambient: Color, diffuse: Color, specular: Color) {
    return new Light(position, ambient, diffuse, specular)
  }

  set()
}

function light() {
  this.pos = new vector(0.0, 0.0, 0.0)
  this.diff = new color(0, 0, 0)
  this.spec = new color(0, 0, 0)
  this.ambt = new color(0, 0, 0)
}

light.prototype.init = function (in_pos, in_diff, in_spec, in_ambt) {
  this.pos = in_pos
  this.diff = in_diff
  this.spec = in_spec
  this.ambt = in_ambt
}

light.prototype.eq = function (in_l) {
  this.pos = in_l.pos.clone()
  this.diff = in_l.diff.clone()
  this.spec = in_l.spec.clone()
  this.ambt = in_l.ambt.clone()

  return this
}

light.prototype.clone = function () {
  const l_out = new light()
  l_out.eq(this)

  return l_out
}
