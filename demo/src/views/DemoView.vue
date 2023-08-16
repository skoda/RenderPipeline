<script lang="ts">
import { defineComponent } from 'vue'
import { Pipeline, Matrix, Vector3, Light, Camera, Circle, Color, Cube } from 'render-pipeline'

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
  mounted() {
    const keysDown = new Set()
    const pipeline = new Pipeline(this.canvasId)
    const camera = new Camera(new Vector3(0, 0, 1), new Vector3(0, 1, 0), new Vector3(0, 5, -20))
    camera.pitchDown(0.2)
    const far = Cube.generate()
    const cube = Cube.generate()
    const floor = Circle.generate(24, 15)
    const axis = new Vector3(1, 4.2, 10)
    const projection = Matrix.projectionWithViewportAndFieldOfView(
      pipeline.width,
      pipeline.height,
      Math.PI / 4
    )
    let angle = Math.PI / 2

    far.worldMatrix = Matrix.translationWithXYZ(0, 2, 10)

    window.addEventListener('keydown', (e) => {
      keysDown.add((e as KeyboardEvent).code)
    })
    window.addEventListener('keyup', (e) => keysDown.delete((e as KeyboardEvent).code))

    cube.loadTexture('marble.png')
    // cube.loadTexture('testgrid.png')
    // floor.loadTexture('flooring.png')
    floor.loadTexture('testgrid.png')
    pipeline.light = Light.withPositionAndColors(
      new Vector3(2, 8, -5),
      new Color(0.1, 0.1, 0.05),
      new Color(1, 0.9, 0.8),
      new Color(0.8, 0.6, 0.3)
    )
    pipeline.shininess = 30
    pipeline.framerateReadoutId = 'framerateView'

    pipeline.projection = projection

    let frameTime = new Date().getTime()
    pipeline.beginLoop(() => {
      const now = new Date().getTime()
      const perSecond = (now - frameTime) * 0.001

      if (keysDown.has(KeyMap.W)) camera.moveForward(5 * perSecond)
      else if (keysDown.has(KeyMap.S)) camera.moveBackward(5 * perSecond)
      if (keysDown.has(KeyMap.A)) camera.moveLeft(5 * perSecond)
      else if (keysDown.has(KeyMap.D)) camera.moveRight(5 * perSecond)

      if (keysDown.has(KeyMap.Up)) camera.pitchUp(1 * perSecond)
      else if (keysDown.has(KeyMap.Down)) camera.pitchDown(1 * perSecond)
      if (keysDown.has(KeyMap.Left)) camera.turnLeft(1 * perSecond)
      else if (keysDown.has(KeyMap.Right)) camera.turnRight(1 * perSecond)

      angle = (angle + 0.03125 * perSecond) % (Math.PI * 2)
      pipeline.view = camera.viewMatrix()
      cube.worldMatrix = Matrix.multiply(
        Matrix.translationWithXYZ(0, 2, 0),
        Matrix.rotationAroundAxis(axis, angle)
      )
      floor.worldMatrix = Matrix.rotationAroundAxis(new Vector3(1, 0, 0), Math.PI / 2)
      pipeline.addStream(cube)
      // pipeline.addStream(far)
      // pipeline.addStream(floor)
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
