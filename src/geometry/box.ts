import { Vector3 } from '../math/index.js'
import { Color, TextureCoord, Vertex } from '../rasterization/index.js'
import { Stream, Primitive, VertexPattern } from './stream.js'

export class Box {
  static generate(
    width = 1,
    height = 1,
    depth = 1,
    diffuse = Color.withWhite(),
    specular = Color.withWhite(),
    proportionalUVs = true
  ): Stream {
    // Vertex orientation:
    //    4 -------------7
    //    |\             |\
    //    | 0--------------3
    //    | |            | |
    //    | |            | |
    //    5-|----------- 6 |
    //     \|             \|
    //      1--------------2
    const w = Math.abs(width / 2)
    const h = Math.abs(height / 2)
    const d = Math.abs(depth / 2)
    const max = Math.max(w, Math.max(h, d))
    const stream = new Stream()
    const v0 = new Vector3(-w, h, -d)
    const v1 = new Vector3(-w, -h, -d)
    const v2 = new Vector3(w, -h, -d)
    const v3 = new Vector3(w, h, -d)
    const v4 = new Vector3(-w, h, d)
    const v5 = new Vector3(-w, -h, d)
    const v6 = new Vector3(w, -h, d)
    const v7 = new Vector3(w, h, d)

    const constructFace = (
      tl: Vector3,
      bl: Vector3,
      br: Vector3,
      tr: Vector3,
      normal: Vector3,
      u: number,
      v: number
    ) => {
      u = proportionalUVs ? u / max : 1
      v = proportionalUVs ? v / max : 1
      const verts = [
        new Vertex(tl, normal, diffuse, specular, new TextureCoord(0, 0)),
        new Vertex(bl, normal, diffuse, specular, new TextureCoord(0, v)),
        new Vertex(br, normal, diffuse, specular, new TextureCoord(u, v)),
        new Vertex(tr, normal, diffuse, specular, new TextureCoord(u, 0))
      ]
      stream.addPrimitive(new Primitive(VertexPattern.Fan, verts, false))
    }

    constructFace(v0, v1, v2, v3, new Vector3(0, 0, -1), w, h) // -z
    constructFace(v4, v5, v1, v0, new Vector3(-1, 0, 0), d, h) // -x
    constructFace(v7, v6, v5, v4, new Vector3(0, 0, 1), w, h) // +z
    constructFace(v3, v2, v6, v7, new Vector3(1, -1, 0), d, h) // +x
    constructFace(v4, v0, v3, v7, new Vector3(0, 1, 0), w, d) // +y
    constructFace(v1, v5, v6, v2, new Vector3(0, -1, 0), w, d) // -y

    return stream
  }
}
