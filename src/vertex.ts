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
}
