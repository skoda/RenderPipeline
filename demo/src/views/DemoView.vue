<script lang="ts">
import { defineComponent } from 'vue'
import { Pipeline, Matrix, Vector3, Light, Circle, Color, Cube } from 'render-pipeline'

export default defineComponent({
  data() {
    return {
      canvasId: 'screenbuffer'
    }
  },
  mounted() {
    const pipeline = new Pipeline(this.canvasId)
    // const cube = Cube.generate()
    const cube = Circle.generate(24)
    const axis = new Vector3(1, 4.2, 10)
    const camera = Matrix.rotationWithLookDirection(new Vector3(0, 0, 1), new Vector3(0, 1, 0))
    const world = Matrix.translationWithXYZ(0, 0, 4) // Move the world away from the origin 4 units
    const projection = Matrix.projectionWithViewportAndFieldOfView(
      pipeline.width,
      pipeline.height,
      Math.PI / 4
    )
    let angle = Math.PI / 2

    cube.loadTexture('marble.png')
    pipeline.light = Light.withPositionAndColors(
      new Vector3(1, 3, 0),
      new Color(0.1, 0.1, 0.05),
      new Color(1, 0.9, 0.8),
      new Color(0.8, 0.6, 0.3)
    )
    pipeline.shininess = 30
    pipeline.framerateReadoutId = 'framerateView'

    pipeline.view = camera
    pipeline.projection = projection

    let frameTime = new Date().getTime()
    pipeline.beginLoop(() => {
      const now = new Date().getTime()
      angle = (angle + 0.003125 * (now - frameTime)) % (Math.PI * 2)
      cube.worldMatrix = Matrix.multiply(world, Matrix.rotationAroundAxis(axis, angle))
      pipeline.addStream(cube)
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
