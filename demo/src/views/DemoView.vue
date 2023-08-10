<script lang="ts">
import { defineComponent } from 'vue'
import Pipeline, { Color, Cube, Vector3, Matrix, Light } from 'render-pipeline'

export default defineComponent({
  data() {
    return {
      canvasId: 'screenbuffer'
    }
  },
  mounted() {
    const pipeline = new Pipeline(this.canvasId)
    const axis = Vector3.withXYZ(1, 4.2, 10)
    const camera = Matrix.rotationWithLookDirection(
      Vector3.withXYZ(0, 1, 0),
      Vector3.withXYZ(0, 0, 1)
    )
    const world = Matrix.translationWithXYZ(0, 0, 4) // Move the world away from the origin 4 units
    const projection = Matrix.projectionWithViewportAndFieldOfView(
      pipeline.width,
      pipeline.height,
      Math.PI / 4
    )
    let angle = Math.PI / 2

    pipeline.loadTexture('marble.png')
    pipeline.light = Light.withPositionAndColors(
      Vector3.withXYZ(1, 3, 0),
      Color.withRGB(0.1, 0.1, 0.05),
      Color.withRGB(1, 0.9, 0.8),
      Color.withRGB(0.8, 0.6, 0.3)
    )
    pipeline.shininess = 30
    pipeline.stream = Cube.generate()

    pipeline.view = camera
    pipeline.projection = projection

    pipeline.beginLoop(() => {
      angle = (angle + 0.5) % (Math.PI * 2)
      pipeline.world = Matrix.multiply(world, Matrix.rotationAroundAxis(axis, angle))
    })
  }
})
</script>

<template>
  <div class="demo">
    <h2>Demo</h2>
    <br />
    <canvas :id="canvasId" width="640" height="360">
      Your browser does not support HTML5 Canvas.
    </canvas>
  </div>
</template>

<style>
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
