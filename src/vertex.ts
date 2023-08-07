import Color from "./color";
import { TextureCoord } from "./texture";
import Vector3 from "./vector3";

export default class Vertex {
  pos: Vector3
  nrm: Vector3
  diff: Color
  spec: Color
  tex: TextureCoord

  constructor(position:Vector3, normal:Vector3, diffuse:Color, specular:Color, texture:TextureCoord) {
    this.pos = position.clone()
    this.nrm = normal.clone()
    this.diff = diffuse.clone()
    this.spec = specular.clone()
    this.tex = texture.clone()
  }
}