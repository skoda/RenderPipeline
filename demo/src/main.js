import { Pipeline, Matrix, Vector3, Light, Camera } from '../lib/render-pipeline/index.js'
import {
  ABMIENT_LIGHT_DEFAULT,
  CANVAS_ID,
  DIFFUSE_LIGHT_DEFAULT,
  EYE_HEIGHT,
  FAR_PLANE,
  FRAMERATE_ID,
  NEAR_PLANE,
  SPECULAR_LIGHT_DEFAULT
} from './consts.js'
import { Controls } from './controls.js'
import { Scene } from './scene.js'
import { Textures } from './textures.js'

const initialize = async () => {
  const pipeline = new Pipeline(CANVAS_ID)
  const camera = new Camera(
    new Vector3(0, 0, 1),
    new Vector3(0, 1, 0),
    new Vector3(0, EYE_HEIGHT, -15)
  )

  await Textures.preloadAll()
  Controls.init(camera)
  Scene.init()

  const img = new Image()
  img.src = 'img/galaxy.png'
  const bgSize = { loaded: false }
  img.onload = () => {
    bgSize.halfHeightDiff = (pipeline.height - img.height) / 2
    bgSize.width = img.width
    bgSize.loaded = true
  }

  // Default light, slightly offset to light
  // non-celestial objects in the scene
  pipeline.light = Light.withOptions({
    dir: new Vector3(10, -15, 7.5),
    ambt: ABMIENT_LIGHT_DEFAULT,
    diff: DIFFUSE_LIGHT_DEFAULT,
    spec: SPECULAR_LIGHT_DEFAULT
  })

  // Setup pipeline defaults and render settings
  pipeline.setDepthPlanes({ near: NEAR_PLANE, far: FAR_PLANE })
  pipeline.shininess = 30
  pipeline.framerateReadoutId = FRAMERATE_ID
  pipeline.projection = Matrix.projectionWithViewportAndFieldOfView(
    pipeline.width,
    pipeline.height,
    Math.PI / 4
  )

  // Performance timers for doing frame length calculations
  const launchTime = performance.now()
  let frameTime = performance.now()

  pipeline.beginLoop(() => {
    const now = performance.now()
    const perSecond = (now - frameTime) * 0.001

    Controls.processInput(perSecond)
    pipeline.view = camera.viewMatrix()

    // Offset the background position based on camera orientation
    if (bgSize.loaded) {
      const { halfHeightDiff: hhd, width: w } = bgSize
      const yOffset = (hhd * camera.pitch) / camera.maxPitch + hhd
      const xOffset = (-w * camera.yaw) / Math.PI
      const pattern = pipeline.renderContext.createPattern(img, 'repeat-x')
      pattern.setTransform(new DOMMatrix([1, 0, 0, 1, xOffset, yOffset]))
      pipeline.clearFillStyle = pattern
    }

    Scene.animate(perSecond, now - launchTime)
    Scene.addRenderStreams(pipeline)
    frameTime = now
  }, true)
}

if (document.location.search === '?about') {
  const about = document.querySelector('template#about')
  const content = document.querySelector('section#content')
  content.replaceChildren(about.content.cloneNode(true))
  document.getElementById('about-link').classList.add('active')
} else {
  document.getElementById('demo-link').classList.add('active')
  initialize()
}
