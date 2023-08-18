<script lang="ts">
import { defineComponent } from 'vue'
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
  Texture,
  TextureAddressingMode
} from 'render-pipeline'

enum KeyMap {
  W = 'KeyW',
  A = 'KeyA',
  S = 'KeyS',
  D = 'KeyD',
  Left = 'ArrowLeft',
  Up = 'ArrowUp',
  Right = 'ArrowRight',
  Down = 'ArrowDown'
}

export default defineComponent({
  data() {
    return {
      canvasId: 'screenbuffer'
    }
  },
  async mounted() {
    const keysDown = new Set()
    window.addEventListener('keydown', (e) => {
      keysDown.add((e as KeyboardEvent).code)
    })
    window.addEventListener('keyup', (e) => keysDown.delete((e as KeyboardEvent).code))

    const pipeline = new Pipeline(this.canvasId)
    const camera = new Camera(new Vector3(0, 0, 1), new Vector3(0, 1, 0), new Vector3(0, 2.25, -15))
    const projection = Matrix.projectionWithViewportAndFieldOfView(
      pipeline.width,
      pipeline.height,
      Math.PI / 4
    )
    let angle = Math.PI / 2

    // Preload textures, they get cached, and some are reused
    await Promise.allSettled([
      Texture.withURL('marble.png'),
      Texture.withURL('earth.png'),
      Texture.withURL('flooring.png'),
      Texture.withURL('stars.png')
    ])

    pipeline.light = new Light()
    pipeline.light.setPosition(new Vector3(-10, 15, -7.5))
    pipeline.light.ambient = new Color(0.3, 0.2, 0.1)
    pipeline.light.diffuse = new Color(1, 0.9, 0.8)
    pipeline.light.specular = new Color(0.9, 0.8, 0.6)

    pipeline.setDepthPlanes({ near: 0.25, far: 75 })
    pipeline.shininess = 30
    pipeline.framerateReadoutId = 'framerateView'
    pipeline.projection = projection

    const floor = Circle.generate(48, 20, 4, Color.withWhite(), Color.withValue(0))
    floor.loadTexture('flooring.png')
    const floorLight = pipeline.light.clone()
    floorLight.setDirection(new Vector3(0, -1, 0))
    floor.worldMatrix = Matrix.rotationWithBasisVectors(
      new Vector3(0, -1, 0),
      new Vector3(0, 0, -1),
      new Vector3(1, 0, 0)
    )
    console.log(floorLight)
    floor.settings.light = floorLight
    floor.settings.textureMode = TextureAddressingMode.Wrap
    floor.settings.shininess = 4

    const cube = Box.generate(1, 1, 1, Color.withWhite(), new Color(0.5, 0.3, 0.1))
    const cubeAxis = new Vector3(1, 4.2, 10)
    cube.loadTexture('marble.png')

    const globe = Sphere.generate(24, 0.75)
    const globeLight = pipeline.light.clone()
    globeLight.emissive = new Color(0.01, 0.01, 0.1)
    globe.loadTexture('earth.png')
    globe.settings.light = globeLight
    globe.settings.shininess = 10

    const pillar = Cylinder.generate(24, 0.65, 2)
    pillar.loadTexture('marble.png')
    pillar.worldMatrix = Matrix.translationWithXYZ(0, 1, 0)

    const pillarBase = Box.generate(2, 0.25, 2)
    pillarBase.worldMatrix = Matrix.translationWithXYZ(0, 0.125, 0)
    pillarBase.loadTexture('marble.png')

    const lightBall = Sphere.generate(8)
    // lightBall.settings.light = pipeline.light.clone()
    // lightBall.settings.light.setDirection(lightBall.settings.light.position)
    // lightBall.settings.light.emissive = new Color(0.2, 0.08, 0.05)
    // lightBall.settings.light.ambient = new Color(0.2, 0.18, 0.05)
    lightBall.worldMatrix = Matrix.translationWithVector(pipeline.light!.position!)

    let frameTime = performance.now()
    const yAxisMovementLock = new Vector3(1, 1, 1) // no flying
    pipeline.beginLoop(() => {
      const now = performance.now()
      const perSecond = (now - frameTime) * 0.001

      if (keysDown.has(KeyMap.W)) camera.moveForward(5 * perSecond, yAxisMovementLock)
      else if (keysDown.has(KeyMap.S)) camera.moveBackward(5 * perSecond, yAxisMovementLock)
      if (keysDown.has(KeyMap.A)) camera.moveLeft(5 * perSecond, yAxisMovementLock)
      else if (keysDown.has(KeyMap.D)) camera.moveRight(5 * perSecond, yAxisMovementLock)

      if (keysDown.has(KeyMap.Up)) camera.pitchUp(1 * perSecond)
      else if (keysDown.has(KeyMap.Down)) camera.pitchDown(1 * perSecond)
      if (keysDown.has(KeyMap.Left)) camera.turnLeft(1 * perSecond)
      else if (keysDown.has(KeyMap.Right)) camera.turnRight(1 * perSecond)

      angle = (angle + 3.125 * perSecond) % (Math.PI * 2)

      cube.worldMatrix = Matrix.multiply(
        Matrix.translationWithXYZ(0, 3.25, 0),
        Matrix.rotationAroundAxis(cubeAxis, angle)
      )

      globe.worldMatrix = Matrix.translationWithXYZ(0, 3.25, 0).multiplyMatrix(
        Matrix.rotationAroundAxis(new Vector3(0, -1, 0), angle)
      )

      pipeline.view = camera.viewMatrix()
      // pipeline.addStream(cube)
      pipeline.addStream(floor)
      pipeline.addStream(pillar)
      pipeline.addStream(pillarBase)
      pipeline.addStream(globe)
      pipeline.addStream(lightBall)
      frameTime = now
    }, true)
  }
})
</script>

<template>
  <div class="demo">
    <h2>Demo</h2>
    <br />
    <div>
      <canvas :id="canvasId" width="640" height="360"></canvas>
      <div id="framerateView"></div>
    </div>
  </div>
</template>

<style>
#framerateView {
  text-align: right;
}
canvas {
  max-width: 100%;
}
@media (min-width: 1024px) {
  .demo {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
