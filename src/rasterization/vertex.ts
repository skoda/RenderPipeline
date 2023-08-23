import { Vector3 } from '../math/index.js'
import { Color } from './color.js'
import { TextureCoord } from './texture.js'

export class Vertex {
  pos: Vector3
  nrm: Vector3
  diff: Color
  spec: Color
  tex: TextureCoord

  constructor(
    position: Vector3,
    normal: Vector3,
    diffuse: Color,
    specular: Color,
    texture: TextureCoord
  ) {
    this.pos = position.clone()
    this.nrm = normal.clone()
    this.diff = diffuse.clone()
    this.spec = specular.clone()
    this.tex = texture.clone()
  }

  clone() {
    return new Vertex(this.pos, this.nrm, this.diff, this.spec, this.tex)
  }

  static interpolate(a: Vertex, b: Vertex, t: number) {
    b = b.clone()
    b.pos.subtract(a.pos).scale(t).add(a.pos)
    b.nrm.subtract(a.nrm).scale(t).add(a.nrm)
    b.diff.subtract(a.diff).scale(t).add(a.diff)
    b.spec.subtract(a.spec).scale(t).add(a.spec)
    b.tex.subtract(a.tex).scale(t).add(a.tex)
    return b
  }
}
