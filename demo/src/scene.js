import {
  Box,
  Circle,
  Color,
  Cylinder,
  Light,
  Matrix,
  Sphere,
  TextureAddressingMode,
  Vector3
} from '../lib/render-pipeline/index.js'
import {
  ABMIENT_LIGHT_DEFAULT,
  DIFFUSE_LIGHT_DEFAULT,
  DOWN_VEC,
  FLOOR_RADIUS,
  SPECULAR_LIGHT_DEFAULT,
  SUN_LIGHT,
  SUN_POSITION
} from './consts.js'
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
    const { texture, textureMode, light, shininess, ignoreDepth, worldMatrix } = opts
    stream.settings.apply({ light, textureMode, shininess, ignoreDepth })
    if (texture) stream.loadTexture(texture)
    if (worldMatrix) stream.worldMatrix = worldMatrix
    const obj = new Object(stream, opts.animate)
    Object.all.push(obj)
    return obj
  }
  runAnimate(frameTime, runTime) {
    if (this.animate) {
      this.stream.worldMatrix = this.animate({ frameTime, runTime })
    }
  }
}

export const Scene = {
  init: () => {
    // Floor
    Object.create(Circle.generate(48, FLOOR_RADIUS, 4, Color.withWhite(), Color.withValue(0.5)), {
      texture: Textures.flooring,
      textureMode: TextureAddressingMode.Wrap,
      light: Light.withOptions({
        dir: new Vector3(0, -1, 0),
        ambt: ABMIENT_LIGHT_DEFAULT,
        diff: DIFFUSE_LIGHT_DEFAULT,
        spec: SPECULAR_LIGHT_DEFAULT
      }),
      shininess: 4,
      worldMatrix: Matrix.rotationWithBasisVectors(
        new Vector3(0, -1, 0),
        new Vector3(0, 0, -1),
        new Vector3(1, 0, 0)
      )
    })

    // Central pillar
    Object.create(Cylinder.generate(200, 0.65, 2), {
      texture: Textures.marble,
      worldMatrix: Matrix.translationWithXYZ(0, 1, 0)
    })
    // Pillar base
    Object.create(Box.generate(2, 0.25, 2), {
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
    Object.create(Sphere.generate(32, 0.75, Color.withWhite(), new Color(0.95, 0.9, 0.65)), {
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
    Object.create(Sphere.generate(16, 0.2), {
      texture: Textures.moon,
      light: SUN_LIGHT,
      shininess: 15,
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

  animate: (frameTime, runTime) => {
    Object.all.forEach((obj) => obj.runAnimate(frameTime, runTime))
  },

  addRenderStreams: (pipeline) => {
    Object.all.forEach((obj) => pipeline.addStream(obj.stream))
  }
}
