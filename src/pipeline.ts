import { Light } from './light'
import Rasterizer from './rasterizer'
import Target from './target'
import { Matrix, Vector3, Vector4 } from './math'
import { Vertex } from './vertex'
import { Primitive, Stream, VertexPattern } from './geometry/stream'
import { DepthBuffer } from './depthBuffer'

export class Pipeline {
  view: Matrix
  worldView: Matrix
  projection: Matrix
  screenTransform: Matrix
  cameraViewPosition: Vector3
  lightViewPosition: Vector3
  streams: Stream[]
  light?: Light
  shininess = 0

  frameRate = 0
  framerateReadoutId = ''

  width: number
  height: number

  screenTarget: Target
  renderTarget: Target
  frameBuffer: ImageData
  depthBuffer: DepthBuffer
  maxDepth = 500
  minDepth = 1
  rasterizer: Rasterizer

  constructor(renderCanvasId: string) {
    this.view = Matrix.withIdentity()
    this.worldView = Matrix.withIdentity()
    this.projection = Matrix.withIdentity()
    this.screenTransform = Matrix.withIdentity()
    this.cameraViewPosition = new Vector3(0, 0, 0)
    this.lightViewPosition = new Vector3(0, 0, 0)
    this.streams = []
    this.shininess = 0
    this.frameRate = 0

    this.screenTarget = Target.withCanvasElementId(renderCanvasId)
    this.width = this.screenTarget.canvas.width
    this.height = this.screenTarget.canvas.height
    this.renderTarget = Target.withDimensions(this.width, this.height)
    this.frameBuffer = this.renderTarget.buffer
    this.depthBuffer = new DepthBuffer(this.width, this.height)
    this.rasterizer = new Rasterizer(this.frameBuffer, this.depthBuffer)

    const w = this.width / 2.0
    const h = this.height / 2.0
    this.screenTransform = Matrix.translationWithXYZ(w, h, -this.minDepth).multiplyMatrix(
      Matrix.scaleWithXYZ(w, -h, this.maxDepth - this.minDepth)
    )
  }

  beginLoop(loop: () => void, vsync = true) {
    const frameData = { count: 0, time: new Date().getTime() }
    const pipelineLoop = () => {
      this.updateFrameRate(frameData)
      this.present()
      loop()
      this.draw()
      this.streams = []
      vsync ? window.requestAnimationFrame(pipelineLoop) : setTimeout(pipelineLoop, 0)
    }
    pipelineLoop()
  }

  addStream(stream: Stream) {
    this.streams.push(stream.clone())
  }

  setDepthPlanes({ far, near }: { far?: number; near?: number }) {
    far && (this.maxDepth = far)
    near && (this.minDepth = near)
  }

  updateFrameRate(frameData: { count: number; time: number }) {
    if (!this.framerateReadoutId) return
    const now = new Date().getTime()
    if (++frameData.count >= 10) {
      this.frameRate = 10000 / Math.max(1, now - frameData.time)
      const el = document.getElementById(this.framerateReadoutId)
      el && (el.innerHTML = `${this.frameRate.toFixed(1)} fps`)
      frameData.time = now
      frameData.count = 0
    }
  }

  clear() {
    this.renderTarget.context.fillStyle = 'rgb(0, 0, 0)'
    this.renderTarget.context.fillRect(0, 0, this.width, this.height)
    this.frameBuffer = this.renderTarget.buffer
    this.depthBuffer.clear()
    this.rasterizer.setFrameBuffer(this.frameBuffer)
  }

  present() {
    this.renderTarget.buffer = this.frameBuffer
    this.screenTarget.context.drawImage(this.renderTarget.canvas, 0, 0, this.width, this.height)
    this.clear()
  }

  draw() {
    if (this.light) {
      const vc = this.view.column(3)
      this.cameraViewPosition = new Vector3(-vc.x, -vc.y, -vc.z)
      this.lightViewPosition = this.view.multiplyVector(Vector4.withPosition(this.light.pos))
    }

    this.streams.forEach((stream) => {
      this.rasterizer.setTexture(stream.texture)
      this.worldView = Matrix.multiply(this.view, stream.worldMatrix)

      stream.primitives.forEach((p) => {
        p.vertices.forEach((v) => {
          this.transformAndLight(v)
        })
        this.triangulateClipTargetMapAndRasterize(p)
      })
    })
  }

  transformAndLight(vert: Vertex) {
    vert.pos = this.worldView.multiplyVector(Vector4.withPosition(vert.pos))

    if (this.light) {
      vert.nrm = this.worldView.multiplyVector(Vector4.withDirection(vert.nrm)).normalize()
      const vertexToLight = Vector3.subtract(this.lightViewPosition, vert.pos).normalize()
      const vertexToCamera = Vector3.subtract(this.cameraViewPosition, vert.pos).normalize()

      const intensity = Math.max(0, vertexToLight.dot(vert.nrm))
      vert.diff.multiply(this.light.diff.clone().scale(intensity).add(this.light.ambt))
      vert.diff.clamp(1.0)

      const betweenLightAndCamera = vertexToLight.add(vertexToCamera).normalize()
      const specularIntensity = Math.max(0, betweenLightAndCamera.dot(vert.nrm))
      const weirdMakeHighlightLookGoodNonsense =
        specularIntensity /
        (this.shininess - this.shininess * specularIntensity + specularIntensity)

      vert.spec.multiply(this.light.spec.clone().scale(weirdMakeHighlightLookGoodNonsense))
      vert.spec.clamp(1.0)
    }

    vert.pos = this.projection.multiplyVector(Vector4.withPosition(vert.pos))
    vert.pos.z = 1.0 / vert.pos.z
    vert.pos.x *= vert.pos.z
    vert.pos.y *= vert.pos.z
  }

  triangulateClipTargetMapAndRasterize(primitive: Primitive) {
    const { pattern, vertices: v } = primitive
    const triangles: Vertex[][] = []
    const counterClockwise = (triangle: Vertex[]) => {
      const pos = triangle.map((vert) => vert.pos)
      return (
        (pos[1].x - pos[0].x) * (pos[2].y - pos[1].y) +
          (pos[1].y - pos[0].y) * (pos[1].x - pos[2].x) >
        0
      )
    }

    switch (pattern) {
      case VertexPattern.Fan:
        for (let i = 2; i < v.length; ++i) {
          triangles.push([v[0].clone(), v[i - 1].clone(), v[i].clone()])
        }
        break
      case VertexPattern.Strip:
        for (let i = 2; i < v.length; ++i) {
          const [a, b, c] = i % 2 ? [i - 2, i, i - 1] : [i - 2, i - 1, i]
          triangles.push([v[a].clone(), v[b].clone(), v[c].clone()])
        }
        break
      default: // VertexPattern.List
        for (let i = 0; i < v.length; i += 3) {
          triangles.push([v[i], v[i + 1], v[i + 2]])
        }
    }

    triangles.forEach((tri) => {
      if (!counterClockwise(tri)) return
      // Clip triangle here in unit square (possibly generates more triangles)

      tri.forEach((vert) => {
        vert.pos = this.screenTransform.multiplyVector(Vector4.withPosition(vert.pos))
      })

      this.rasterizer.triangleDraw(tri)
    })
  }
}
