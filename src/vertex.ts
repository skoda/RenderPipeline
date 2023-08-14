import { Color } from './color'
import { TextureCoord } from './texture'
import { Vector3 } from './math'

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

  static perspectiveCorrectInterpolate(a: Vertex, b: Vertex, t: number) {
    b = b.clone()
    const aPos = a.pos.clone()
    const aTex = a.tex.clone()
    b.pos.z = 1 / b.pos.z
    b.tex.scale(b.pos.z)
    aPos.z = 1 / aPos.z
    aTex.scale(aPos.z)
    b.pos.subtract(aPos).scale(t).add(aPos)
    b.pos.z = 1 / b.pos.z
    b.nrm.subtract(a.nrm).scale(t).add(a.nrm)
    b.diff.subtract(a.diff).scale(t).add(a.diff)
    b.spec.subtract(a.spec).scale(t).add(a.spec)
    b.tex.subtract(aTex).scale(t).add(aTex).scale(b.pos.z)
    return b
  }
}
