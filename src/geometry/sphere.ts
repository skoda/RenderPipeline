import { Vector3 } from '../math/index.js'
import { Color, TextureCoord, Vertex } from '../rasterization/index.js'
import { Stream, Primitive, VertexPattern } from './stream.js'

export class Sphere {
  static generate(
    steps = 12,
    radius = 0.5,
    diffuse = Color.withWhite(),
    specular = Color.withWhite()
  ): Stream {
    const stream = new Stream()
    const longitude = steps * 2
    const latitude = steps

    let longA = 0
    let cosLongA = Math.cos(longA)
    let sinLongA = Math.sin(longA)
    for (let i = 0; i < longitude; ++i) {
      const longB = i + 1 === longitude ? 0 : ((i + 1) * 2 * Math.PI) / longitude
      const cosLongB = Math.cos(longB)
      const sinLongB = Math.sin(longB)
      const poleTexU = (i + 0.5) / longitude
      const verts: Vertex[] = []

      // North pole
      verts.push(
        new Vertex(
          new Vector3(0, radius, 0),
          new Vector3(0, 1, 0),
          diffuse,
          specular,
          new TextureCoord(poleTexU, 0)
        )
      )

      for (let j = 1; j < latitude; ++j) {
        const lat = (j * Math.PI) / latitude
        const cosLat = Math.cos(lat)
        const sinLat = Math.sin(lat)

        const nrmA = new Vector3(cosLongA * sinLat, cosLat, sinLongA * sinLat)
        const nrmB = new Vector3(cosLongB * sinLat, cosLat, sinLongB * sinLat)

        verts.push(
          new Vertex(
            nrmA.clone().scale(radius),
            nrmA,
            diffuse,
            specular,
            new TextureCoord(i / longitude, j / latitude)
          ),
          new Vertex(
            nrmB.clone().scale(radius),
            nrmB,
            diffuse,
            specular,
            new TextureCoord((i + 1) / longitude, j / latitude)
          )
        )
      }

      // South pole
      verts.push(
        new Vertex(
          new Vector3(0, -radius, 0),
          new Vector3(0, -1, 0),
          diffuse,
          specular,
          new TextureCoord(poleTexU, 1)
        )
      )

      longA = longB
      cosLongA = cosLongB
      sinLongA = sinLongB
      stream.addPrimitive(new Primitive(VertexPattern.Strip, verts, false))
    }

    return stream
  }
}
