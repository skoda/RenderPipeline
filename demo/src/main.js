import {
  Pipeline,
  Matrix,
  Vector3,
  Light,
  Camera,
  Circle,
  Color,
  Box,
  Cylinder,
  Sphere,
  TextureAddressingMode
} from '../lib/render-pipeline/index.js'
import { EYE_HEIGHT, FLOOR_RADIUS } from './consts.js'
import { Controls } from './controls.js'
import { Textures } from './textures.js'

const pipeline = new Pipeline('canvasId')
const camera = new Camera(
  new Vector3(0, 0, 1),
  new Vector3(0, 1, 0),
  new Vector3(0, EYE_HEIGHT, -15)
)

let angle = 0

Controls.init(camera)
await Textures.preloadAll()

pipeline.light = new Light()
pipeline.light.setPosition(new Vector3(-10, 15, -7.5))
pipeline.light.ambient = new Color(0.3, 0.2, 0.1)
pipeline.light.diffuse = new Color(1, 0.9, 0.8)
pipeline.light.specular = new Color(0.9, 0.8, 0.6)

// Setup pipeline defaults and render settings
pipeline.setDepthPlanes({ near: 0.25, far: 75 })
pipeline.shininess = 30
pipeline.framerateReadoutId = 'framerateView'
pipeline.projection = Matrix.projectionWithViewportAndFieldOfView(
  pipeline.width,
  pipeline.height,
  Math.PI / 4
)

const floor = Circle.generate(48, FLOOR_RADIUS, 4, Color.withWhite(), Color.withValue(0.5))
floor.loadTexture(Textures.flooring)
const floorLight = pipeline.light.clone()
floorLight.setDirection(new Vector3(0, -1, 0))
floor.worldMatrix = Matrix.rotationWithBasisVectors(
  new Vector3(0, -1, 0),
  new Vector3(0, 0, -1),
  new Vector3(1, 0, 0)
)
floor.settings.light = floorLight
floor.settings.textureMode = TextureAddressingMode.Wrap
floor.settings.shininess = 4

const cube = Box.generate(1, 1, 1, Color.withWhite(), new Color(0.5, 0.3, 0.1))
const cubeAxis = new Vector3(1, 4.2, 10)
cube.loadTexture(Textures.marble)

const sun = Sphere.generate(24, 1)
const sunLight = new Light()
sunLight.ambient = Color.withWhite()
sunLight.emissive = new Color(0.95, 0.85, 0.7)
sun.loadTexture(Textures.sun)
sun.settings.light = sunLight
sun.settings.shininess = 10

const globe = Sphere.generate(24, 0.75)
const globeLight = pipeline.light.clone()
let sunOrbit = 0
globeLight.emissive = new Color(0.01, 0.01, 0.1)
globe.loadTexture(Textures.earth)
globe.settings.light = globeLight
globe.settings.shininess = 10

const pillar = Cylinder.generate(24, 0.65, 2)
pillar.loadTexture(Textures.marble)
pillar.worldMatrix = Matrix.translationWithXYZ(0, 1, 0)

const pillarBase = Box.generate(2, 0.25, 2)
pillarBase.worldMatrix = Matrix.translationWithXYZ(0, 0.125, 0)
pillarBase.loadTexture(Textures.marble)

const lightBall = Sphere.generate(8)
lightBall.settings.light = pipeline.light.clone()
lightBall.settings.light.setDirection(lightBall.settings.light.position)
lightBall.settings.light.emissive = new Color(0.2, 0.08, 0.05)
lightBall.settings.light.ambient = new Color(0.2, 0.18, 0.05)
lightBall.worldMatrix = Matrix.translationWithVector(pipeline.light.position)

let frameTime = performance.now()
pipeline.beginLoop(() => {
  const now = performance.now()
  const perSecond = (now - frameTime) * 0.001

  Controls.inputTest(perSecond)

  angle = (angle + 3.125 * perSecond) % (Math.PI * 2)
  sunOrbit = (sunOrbit + 0.125 * perSecond) % (Math.PI * 2)

  cube.worldMatrix = Matrix.multiply(
    Matrix.translationWithXYZ(0, 3.25, 0),
    Matrix.rotationAroundAxis(cubeAxis, angle)
  )

  globe.worldMatrix = Matrix.rotationAroundAxis(new Vector3(0, -1, 0), sunOrbit).multiplyMatrix(
    Matrix.translationWithXYZ(7, 3.25, 0).multiplyMatrix(
      Matrix.rotationAroundAxis(new Vector3(0, -1, 0.2), angle)
    )
  )

  sun.worldMatrix = Matrix.translationWithXYZ(0, 3.25, 0).multiplyMatrix(
    Matrix.rotationAroundAxis(new Vector3(0, 1, 0), angle * 2)
  )

  pipeline.view = camera.viewMatrix()
  // pipeline.addStream(cube)
  pipeline.addStream(floor)
  pipeline.addStream(pillar)
  pipeline.addStream(pillarBase)
  pipeline.addStream(globe)
  pipeline.addStream(lightBall)
  pipeline.addStream(sun)
  frameTime = now
}, true)
