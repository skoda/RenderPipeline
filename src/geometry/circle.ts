import { Vector3 } from '../math/index.js'
import { Color, TextureCoord, Vertex } from '../rasterization/index.js'
import { Stream, Primitive, VertexPattern } from './stream.js'

export class Circle {
  static generate(
    steps = 12,
    radius = 0.5,
    txScale = 1,
    diffuse = Color.withWhite(),
    specular = Color.withWhite()
  ): Stream {
    const stream = new Stream()
    const nrm = new Vector3(0, 0, -1)
    const verts: Vertex[] = []
    txScale *= 0.5

    for (let i = 0; i < steps; ++i) {
      const a = (i * 2 * Math.PI) / steps
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      verts.push(
        new Vertex(
          new Vector3(cos * radius, sin * radius, 0),
          nrm,
          diffuse,
          specular,
          new TextureCoord(txScale * (1 + cos), txScale * (1 + sin))
        )
      )
    }

    stream.addPrimitive(new Primitive(VertexPattern.Fan, verts, false))

    return stream
  }
}
