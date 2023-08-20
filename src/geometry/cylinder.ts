import { Vector3 } from '../math'
import { Color, TextureCoord, Vertex } from '../rasterization'
import { Primitive, Stream, VertexPattern } from './stream'

export class Cylinder {
  static generate(
    steps = 12,
    radius = 0.5,
    height = 1,
    diffuse = Color.withWhite(),
    specular = Color.withWhite()
  ) {
    const stream = new Stream()
    const top: Vertex[] = []
    const bottom: Vertex[] = []
    const sides: Vertex[] = []

    const topNrm = new Vector3(0, 1, 0)
    const botNrm = new Vector3(0, -1, 0)
    height = height / 2

    for (let i = 0; i <= steps; ++i) {
      const a = (i * 2 * Math.PI) / steps
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      const sideNrm = new Vector3(cos, 0, sin)

      sides.push(
        new Vertex(
          new Vector3(cos * radius, height, sin * radius),
          sideNrm,
          diffuse,
          specular,
          new TextureCoord(Math.abs((2 * i) / steps - 1), 0)
        ),
        new Vertex(
          new Vector3(cos * radius, -height, sin * radius),
          sideNrm,
          diffuse,
          specular,
          new TextureCoord(Math.abs((2 * i) / steps - 1), 1)
        )
      )

      // Sides triangle strip needs the final verts, the fans don't
      if (i === steps) break

      top.push(
        new Vertex(
          new Vector3(cos * radius, height, sin * radius),
          topNrm,
          diffuse,
          specular,
          new TextureCoord((1 + cos) / 2, (1 + sin) / 2)
        )
      )

      bottom.push(
        new Vertex(
          new Vector3(cos * radius, -height, -sin * radius),
          botNrm,
          diffuse,
          specular,
          new TextureCoord((1 + cos) / 2, (1 + sin) / 2)
        )
      )
    }

    stream.addPrimitive(new Primitive(VertexPattern.Fan, top, false))
    stream.addPrimitive(new Primitive(VertexPattern.Fan, bottom, false))
    stream.addPrimitive(new Primitive(VertexPattern.Strip, sides, false))

    return stream
  }
}
