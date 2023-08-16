import { Color } from '../color'
import { TextureCoord } from '../texture'
import { Vector3 } from '../math'
import { Vertex } from '../vertex'
import { Stream, Primitive, VertexPattern } from './stream'

export class Circle {
  static generate(
    steps = 12,
    size = 1,
    diffuse = Color.withWhite(),
    specular = Color.withWhite()
  ): Stream {
    const r = size / 2
    const stream = new Stream()
    const nrm = new Vector3(0, 0, -1)
    const verts: Vertex[] = []

    for (let i = 0; i < steps; ++i) {
      const a = (i * 2 * Math.PI) / steps
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      if ([0, 12, 13].includes(i))
        verts.push(
          new Vertex(
            new Vector3(cos * r, sin * r, 0),
            nrm,
            diffuse,
            specular,
            // new TextureCoord(0.5 * (1 + cos), 0.5 * (1 + sin))
            new TextureCoord(2 * cos, 2 * sin)
          )
        )
    }

    stream.addPrimitives(new Primitive(VertexPattern.Fan, verts, false))

    return stream
  }
}
