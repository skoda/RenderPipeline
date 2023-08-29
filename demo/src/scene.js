import {
  Box,
  Circle,
  Color,
  Cylinder,
  gaussianRandom,
  Light,
  Matrix,
  Primitive,
  Sphere,
  Stream,
  TextureAddressingMode,
  TextureCoord,
  Vector3,
  Vertex,
  VertexPattern
} from '../lib/render-pipeline/index.js'
import { DOWN_VEC, FLOOR_RADIUS, SUN_LIGHT, SUN_POSITION } from './consts.js'
import { Textures } from './textures.js'

class Object {
  static all = []
  stream = null
  animate = null
  constructor(stream, animate = null) {
    this.stream = stream
    this.animate = animate
  }
  static create(stream, opts = {}) {
    const { texture, addressingMode, samplingMode, light, shininess, ignoreDepth, worldMatrix } =
      opts
    stream.settings.apply({ light, addressingMode, samplingMode, shininess, ignoreDepth })
    if (texture) stream.loadTexture(texture)
    if (worldMatrix) stream.worldMatrix = worldMatrix
    const obj = new Object(stream, opts.animate)
    Object.all.push(obj)
    return obj
  }
  runAnimate(frameTime, runTime, camera) {
    if (this.animate) {
      this.stream.worldMatrix = this.animate({ frameTime, runTime, camera })
    }
  }
}

export const Scene = {
  init: () => {
    // Starfield
    Object.create(generateStarfield(), {
      ignoreDepth: true,
      light: Light.withOptions({
        ambt: new Color(1, 1, 1)
      }),
      animate: ({ camera }) => {
        return Matrix.translationWithVector(camera.position)
      }
    })

    // Floor
    Object.create(Circle.generate(48, FLOOR_RADIUS, 4, Color.withWhite(), Color.withValue(0.5)), {
      texture: Textures.flooring,
      addressingMode: TextureAddressingMode.Wrap,
      shininess: 2,
      worldMatrix: Matrix.rotationWithBasisVectors(
        new Vector3(0, -1, 0),
        new Vector3(0, 0, -1),
        new Vector3(1, 0, 0)
      )
    })

    // Central pillar
    Object.create(
      Cylinder.generate(32, 0.65, 1.75, Color.withWhite(), Color.withWhite(), ['bottom']),
      {
        texture: Textures.marble,
        addressingMode: TextureAddressingMode.Mirror,
        worldMatrix: Matrix.translationWithXYZ(0, 1.125, 0)
      }
    )
    // Pillar base
    Object.create(Box.generate(2, 0.25, 2, Color.withWhite(), Color.withWhite(), ['bottom']), {
      texture: Textures.marble,
      worldMatrix: Matrix.translationWithXYZ(0, 0.125, 0)
    })

    // Sun
    Object.create(Sphere.generate(20, 1), {
      texture: Textures.sun,
      light: Light.withOptions({
        ambt: new Color(0, 1, 0),
        emsv: new Color(0.85, 0.75, 0.6)
      }),
      animate: ({ runTime }) => {
        const angle = (runTime * 0.00625) % (Math.PI * 2)
        return Matrix.translationWithVector(SUN_POSITION).multiplyMatrix(
          Matrix.rotationAroundAxis(new Vector3(0, 1, 0), angle)
        )
      }
    })

    // Earth
    const earthLight = SUN_LIGHT.clone()
    earthLight.emissive = new Color(0.02, 0.02, 0.12)
    const earthOrbitalPositionMatrix = (runTime) => {
      const orbitAngle = (runTime * 0.000125) % (Math.PI * 2)
      const orbitRotation = Matrix.rotationAroundAxis(DOWN_VEC, orbitAngle)
      const orbitTranslation = Matrix.translationWithVector(new Vector3(12, 0, 0).add(SUN_POSITION))
      return orbitRotation.multiplyMatrix(orbitTranslation)
    }
    Object.create(Sphere.generate(30, 0.75, Color.withWhite(), new Color(0.95, 0.9, 0.65)), {
      texture: Textures.earth,
      light: earthLight,
      shininess: 25,
      animate: ({ runTime }) => {
        const rotAngle = (runTime * 0.003125) % (Math.PI * 2)
        const rotation = Matrix.rotationAroundAxis(DOWN_VEC, rotAngle)
        return earthOrbitalPositionMatrix(runTime).multiplyMatrix(rotation)
      }
    })

    // Moon
    Object.create(Sphere.generate(16, 0.2, Color.withWhite(), Color.withValue(0.4)), {
      texture: Textures.moon,
      light: SUN_LIGHT,
      shininess: 10,
      animate: ({ runTime }) => {
        const orbitAngle = (runTime * 0.0015) % (Math.PI * 2)
        const orbitRotation = Matrix.rotationAroundAxis(DOWN_VEC, orbitAngle)
        const orbitTranslation = Matrix.translationWithVector(new Vector3(4, 0, 0))
        return earthOrbitalPositionMatrix(runTime)
          .multiplyMatrix(orbitRotation)
          .multiplyMatrix(orbitTranslation)
      }
    })
  },

  animate: (frameTime, runTime, camera) => {
    Object.all.forEach((obj) => obj.runAnimate(frameTime, runTime, camera))
  },

  addRenderStreams: (pipeline) => {
    Object.all.forEach((obj) => pipeline.addStream(obj.stream))
  }
}

const generateStarfield = () => {
  const stream = new Stream()
  const stars = []
  const up = new Vector3(0, 1, 0)
  for (let i = 400; --i; ) {
    const normal = new Vector3(gaussianRandom(), gaussianRandom(), gaussianRandom())
    normal.normalize()
    const starSize = 0.08 + Math.random() * 0.005
    const center = normal.clone().negate().scale(54)
    const xAxis = Vector3.cross(normal, up).normalize().scale(starSize)
    const yAxis = Vector3.cross(xAxis, normal).normalize().scale(starSize)
    const tex = new TextureCoord(0, 0)
    const white = Color.withWhite()
    stars.push(new Vertex(yAxis.clone().add(center), normal, white, white, white, tex))
    xAxis.scale(-0.8660254037844388)
    yAxis.scale(-0.5)
    stars.push(new Vertex(xAxis.clone().add(yAxis).add(center), normal, white, white, white, tex))
    stars.push(new Vertex(xAxis.negate().add(yAxis).add(center), normal, white, white, white, tex))
  }
  stream.addPrimitive(new Primitive(VertexPattern.List, stars, false))
  return stream
}
