import Light from './light'
import Matrix from './matrix'
import Rasterizer from './rasterizer'
import Target from './target'
import Texture from './texture'
import Vector3 from './vector3'
import Vector4 from './vector4'
import Vertex from './vertex'

export default class Pipeline {
  world: Matrix
  view: Matrix
  worldView: Matrix
  projection: Matrix
  screenTransform: Matrix
  stream: Vertex[]
  light?: Light
  texture?: Texture
  shininess: number

  width: number
  height: number

  screenTarget: Target
  renderTarget: Target
  frameBuffer: ImageData
  rasterizer: Rasterizer

  constructor(renderCanvasId: string) {
    this.world = Matrix.withIdentity()
    this.view = Matrix.withIdentity()
    this.worldView = Matrix.withIdentity()
    this.projection = Matrix.withIdentity()
    this.screenTransform = Matrix.withIdentity()
    this.stream = []
    this.shininess = 0

    this.screenTarget = Target.withCanvasElementId(renderCanvasId)
    this.width = this.screenTarget.canvas.width
    this.height = this.screenTarget.canvas.height
    this.renderTarget = Target.withDimensions(this.width, this.height)
    this.frameBuffer = this.renderTarget.buffer
    this.rasterizer = new Rasterizer(this.frameBuffer)
  }

  clear() {
    this.renderTarget.context.fillStyle = 'rgb(0, 0, 0)'
    this.renderTarget.context.fillRect(0, 0, this.width, this.height)
    this.frameBuffer = this.renderTarget.buffer
    this.rasterizer.setFrameBuffer(this.frameBuffer)
  }

  present() {
    this.renderTarget.buffer = this.frameBuffer
    this.screenTarget.context.drawImage(this.renderTarget.canvas, 0, 0, this.width, this.height)
    this.clear()
  }

  async loadTexture(url: string) {
    this.texture = await Texture.withURL(url)
  }

  draw() {
    const w = this.width / 2.0
    const h = this.height / 2.0

    this.worldView = Matrix.multiply(this.view, this.world)
    this.screenTransform = Matrix.translationWithXYZ(w, h, 0).multiplyMatrix(
      Matrix.scaleWithXYZ(w, -h, -1)
    )

    for (let i = 0; i + 3 <= this.stream.length; ) {
      const triangle = [
        this.stream[i++].clone(),
        this.stream[i++].clone(),
        this.stream[i++].clone()
      ]

      this.transformAndLight(triangle)
      this.normalizeAndClip(triangle)
      this.targetMapAndRasterize(triangle)
    }
  }

  transformAndLight(triangle: Vertex[]) {
    triangle.forEach((vert) => {
      vert.pos = this.worldView.multiplyVector(Vector4.withPosition(vert.pos))

      if (this.light) {
        const [cx, cy, cz] = this.view.column(3)
        const cameraPos = Vector3.withXYZ(cx, cy, cz).negate()
        const lightPos = this.view.multiplyVector(Vector4.withPosition(this.light.pos))

        vert.nrm = this.worldView.multiplyVector(Vector4.withDirection(vert.nrm)).normalize()
        const vertexToLight = lightPos.subtract(vert.pos).normalize()
        const vertexToCamera = cameraPos.subtract(vert.pos).normalize()

        const intensity = Math.max(0, Vector3.dot(vertexToLight, vert.nrm))
        vert.diff.multiply(this.light.diff.clone().scale(intensity).add(this.light.ambt))
        vert.diff.clamp(1.0)

        const betweenLightAndCamera = Vector3.add(vertexToLight, vertexToCamera).normalize()
        const specularIntensity = Math.max(0, Vector3.dot(betweenLightAndCamera, vert.nrm))
        const weirdMakeHighlightLookGoodNonsense =
          specularIntensity /
          (this.shininess - this.shininess * specularIntensity + specularIntensity)

        vert.spec.multiply(this.light.spec.clone().scale(weirdMakeHighlightLookGoodNonsense))
        vert.spec.clamp(1.0)
      }
    })
  }

  normalizeAndClip(triangle: Vertex[]) {
    // TODO: Clip
    triangle.forEach((vert) => {
      vert.pos = this.projection.multiplyVector(Vector4.withPosition(vert.pos))
      vert.pos.z = 1.0 / vert.pos.z
      vert.pos.x *= vert.pos.z
      vert.pos.y *= vert.pos.z
    })
  }

  targetMapAndRasterize(triangle: Vertex[]) {
    const counterClockwise = (triangle: Vertex[]) => {
      const pos = triangle.map((vert) => vert.pos)
      return (
        (pos[1].x - pos[0].x) * (pos[2].y - pos[1].y) +
          (pos[1].y - pos[0].y) * (pos[1].x - pos[2].x) <
        0
      )
    }

    triangle.forEach((vert) => {
      vert.pos = this.screenTransform.multiplyVector(Vector4.withPosition(vert.pos))
    })

    if (counterClockwise(triangle)) {
      this.rasterizer.triangleDraw(triangle)
    }
  }
}
