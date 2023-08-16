import { Light } from './light'
import Rasterizer from './rasterizer'
import Target from './target'
import { Matrix, Vector3, Vector4 } from './math'
import { Vertex } from './vertex'
import { Primitive, Stream, VertexPattern } from './geometry/stream'
import { DepthBuffer } from './depthBuffer'

enum ClippingFace {
  Front = 0,
  Back = 1,
  Left = 2,
  Right = 3,
  Top = 4,
  Bottom = 5
}

const DEFAULT_MAX_DEPTH = 60
const DEFAULT_MIN_DEPTH = 3

export class Pipeline {
  // Transformations and settings
  view: Matrix
  worldView: Matrix
  projection: Matrix
  screenTransform: Matrix
  streams: Stream[] = []
  light?: Light
  shininess = 0

  // Calculated view space positions
  cameraViewPosition: Vector3
  lightViewPosition: Vector3

  // Rasterization objects and values
  rasterizer: Rasterizer
  screenTarget: Target
  renderTarget: Target
  frameBuffer: ImageData
  width: number
  height: number

  // Depth and clipping
  depthBuffer: DepthBuffer
  maxDepth = DEFAULT_MAX_DEPTH
  minDepth = DEFAULT_MIN_DEPTH
  recipMaxDepth = 1 / DEFAULT_MAX_DEPTH
  recipMinDepth = 1 / DEFAULT_MIN_DEPTH
  clipTest = {
    [ClippingFace.Left]: (vert: Vertex) => vert.pos.x < -vert.pos.z,
    [ClippingFace.Right]: (vert: Vertex) => vert.pos.x > vert.pos.z,
    [ClippingFace.Top]: (vert: Vertex) => vert.pos.y < -vert.pos.z,
    [ClippingFace.Bottom]: (vert: Vertex) => vert.pos.y > vert.pos.z,
    [ClippingFace.Front]: (vert: Vertex) => vert.pos.z < this.minDepth,
    [ClippingFace.Back]: (vert: Vertex) => vert.pos.z > this.maxDepth
  }
  // clipInterpolation = {
  //   [ClippingFace.Left]: (a: Vertex, b: Vertex) => (-1 - a.pos.x) / (b.pos.x - a.pos.x),
  //   [ClippingFace.Right]: (a: Vertex, b: Vertex) => (1 - a.pos.x) / (b.pos.x - a.pos.x),
  //   [ClippingFace.Top]: (a: Vertex, b: Vertex) => (-1 - a.pos.y) / (b.pos.y - a.pos.y),
  //   [ClippingFace.Bottom]: (a: Vertex, b: Vertex) => (1 - a.pos.y) / (b.pos.y - a.pos.y),
  //   [ClippingFace.Front]: (a: Vertex, b: Vertex) => (this.minDepth - a.pos.z) / (b.pos.z - a.pos.z),
  //   [ClippingFace.Back]: (a: Vertex, b: Vertex) => (a.pos.z - this.maxDepth) / (a.pos.z - b.pos.z)
  // }

  clipInterpolation = {
    [ClippingFace.Left]: (a: Vector3, b: Vector3) => (-a.z - a.x) / (-a.z - a.x + b.x + b.z),
    [ClippingFace.Right]: (a: Vector3, b: Vector3) => (a.z - a.x) / (a.z - a.x + b.x - b.z),
    [ClippingFace.Top]: (a: Vector3, b: Vector3) => (-a.z - a.y) / (-a.z - a.y + b.y + b.z),
    [ClippingFace.Bottom]: (a: Vector3, b: Vector3) => (a.z - a.y) / (a.z - a.y + b.y - b.z),
    [ClippingFace.Front]: (a: Vector3, b: Vector3) => (this.minDepth - a.z) / (b.z - a.z),
    [ClippingFace.Back]: (a: Vector3, b: Vector3) => (a.z - this.maxDepth) / (a.z - b.z)
  }

  // Metadata / Other
  frameRate = 0
  framerateReadoutId = ''

  constructor(renderCanvasId: string) {
    this.view = Matrix.withIdentity()
    this.worldView = Matrix.withIdentity()
    this.projection = Matrix.withIdentity()
    this.screenTransform = Matrix.withIdentity()
    this.cameraViewPosition = new Vector3(0, 0, 0)
    this.lightViewPosition = new Vector3(0, 0, 0)

    this.screenTarget = Target.withCanvasElementId(renderCanvasId)
    this.width = this.screenTarget.canvas.width
    this.height = this.screenTarget.canvas.height
    this.renderTarget = Target.withDimensions(this.width, this.height)
    this.frameBuffer = this.renderTarget.buffer
    this.depthBuffer = new DepthBuffer(this.width, this.height)
    this.rasterizer = new Rasterizer(this.frameBuffer, this.depthBuffer)

    const w = this.width / 2.0
    const h = this.height / 2.0
    this.screenTransform = Matrix.translationWithXYZ(w - 0.5, h - 0.5, 0).multiplyMatrix(
      Matrix.scaleWithXYZ(w, -h, 1)
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
    this.recipMaxDepth = 1 / this.maxDepth
    this.recipMinDepth = 1 / this.minDepth

    // this.clipTest[ClippingFace.Front] = (vert: Vertex) => vert.pos.z > this.recipMinDepth
    // this.clipTest[ClippingFace.Back] = (vert: Vertex) => vert.pos.z < this.recipMaxDepth
    // this.clipInterpolation[ClippingFace.Front] = (a: Vertex, b: Vertex) =>
    //   (this.recipMinDepth - a.pos.z) / (b.pos.z - a.pos.z)
    // this.clipInterpolation[ClippingFace.Back] = (a: Vertex, b: Vertex) =>
    //   (this.recipMaxDepth - a.pos.z) / (b.pos.z - a.pos.z)
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

    // const z = 1 / vert.pos.z
    // vert.pos.x *= z
    // vert.pos.y *= z
    // vert.tex.scale(z)
    // Map z to between 0 and 1 (corresponding to depth planes)
    // vert.pos.z = 1 / vert.pos.z //(vert.pos.z - this.minDepth) / (this.maxDepth - this.minDepth)
  }

  triangulateClipTargetMapAndRasterize(primitive: Primitive) {
    const { pattern, vertices: v } = primitive
    const triangles: Vertex[][] = []

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
      if (!Pipeline.counterClockwise(tri)) return

      // Clip triangle here (possibly generates more triangles)
      const clipped = this.clipTriangles([tri])

      clipped.forEach((clippedTri) => {
        clippedTri.forEach((vert) => {
          vert.pos.z = 1 / vert.pos.z
          vert.pos.x *= vert.pos.z
          vert.pos.y *= vert.pos.z
          vert.tex.scale(vert.pos.z)
          vert.pos = this.screenTransform.multiplyVector(Vector4.withPosition(vert.pos))
        })

        this.rasterizer.triangleDraw(clippedTri)
      })
    })
  }

  static counterClockwise = (triangle: Vertex[]) => {
    const pos = triangle.map((vert) => vert.pos)
    return (
      (pos[1].x - pos[0].x) * (pos[2].y - pos[1].y) +
        (pos[1].y - pos[0].y) * (pos[1].x - pos[2].x) >
      0
    )
  }

  // Recursively clip triangles against every edge of the normalized view frustum
  clipTriangles(triangles: Vertex[][], face = ClippingFace.Front): Vertex[][] {
    const clippedTriangles: Vertex[][] = []

    triangles.forEach((tri) => {
      const outside: Vertex[] = []
      const inside: Vertex[] = []

      tri.forEach((vert) => {
        this.clipTest[face](vert) ? outside.push(vert) : inside.push(vert)
      })

      if (outside.length === 3) {
        return
      } else if (!outside.length) {
        clippedTriangles.push(tri)
      } else {
        clippedTriangles.push(...this.generateClipped(inside, outside, face))
      }
    })

    return face === ClippingFace.Top || !clippedTriangles.length
      ? clippedTriangles
      : this.clipTriangles(clippedTriangles, face + 1)
  }

  generateClipped(inside: Vertex[], outside: Vertex[], face: ClippingFace) {
    const edgeVerts: Vertex[] = []

    inside.forEach((inVert) => {
      outside.forEach((outVert) => {
        const t = this.clipInterpolation[face](outVert.pos, inVert.pos)
        edgeVerts.push(Vertex.interpolate(outVert, inVert, t))
      })
    })

    if (inside.length === 1) {
      return [[inside[0], ...edgeVerts]]
    }

    return [
      [edgeVerts[0].clone(), inside[0], inside[1]],
      [inside[1].clone(), edgeVerts[0], edgeVerts[1]]
    ]
  }
}
