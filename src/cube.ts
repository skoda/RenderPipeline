import Color from './color'
import { TextureCoord } from './texture'
import Vector3 from './vector3'
import Vertex from './vertex'

export default class Cube {
  static generate(size = 1, diffuse = Color.withWhite(), specular = Color.withWhite()) {
    // Vertex orientation:
    //    4 -------------7
    //    |\             |\
    //    | 0--------------3
    //    | |            | |
    //    | |            | |
    //    5-|----------- 6 |
    //     \|             \|
    //      1--------------2
    const d = size / 2
    const verts: Vertex[] = []
    const v0 = new Vector3(-d, d, -d)
    const v1 = new Vector3(-d, -d, -d)
    const v2 = new Vector3(d, -d, -d)
    const v3 = new Vector3(d, d, -d)
    const v4 = new Vector3(-d, d, d)
    const v5 = new Vector3(-d, -d, d)
    const v6 = new Vector3(d, -d, d)
    const v7 = new Vector3(d, d, d)
    const txTl = new TextureCoord(0, 0)
    const txBl = new TextureCoord(0, 1)
    const txBr = new TextureCoord(1, 1)
    const txTr = new TextureCoord(1, 0)

    const constructFace = (tl: Vector3, bl: Vector3, br: Vector3, tr: Vector3, normal: Vector3) => {
      verts.push(new Vertex(tl, normal, diffuse, specular, txTl))
      verts.push(new Vertex(bl, normal, diffuse, specular, txBl))
      verts.push(new Vertex(br, normal, diffuse, specular, txBr))
      verts.push(new Vertex(tl, normal, diffuse, specular, txTl))
      verts.push(new Vertex(br, normal, diffuse, specular, txBr))
      verts.push(new Vertex(tr, normal, diffuse, specular, txTr))
    }

    constructFace(v0, v1, v2, v3, new Vector3(0, 0, -1)) // -z
    constructFace(v4, v5, v1, v0, new Vector3(-1, 0, 0)) // -x
    constructFace(v7, v6, v5, v4, new Vector3(0, 0, 1)) // +z
    constructFace(v3, v2, v6, v7, new Vector3(1, -1, 0)) // +x
    constructFace(v4, v0, v3, v7, new Vector3(0, 1, 0)) // +y
    constructFace(v1, v5, v6, v2, new Vector3(0, -1, 0)) // -y
    return verts
  }
}
