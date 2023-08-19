import { Light } from './light'
import Rasterizer from './rasterizer'
import Target from './target'
import { Matrix, Vector3, Vector4 } from './math'
import { Vertex } from './vertex'
import { Primitive, Stream, VertexPattern } from './geometry/stream'
import { DepthBuffer } from './depthBuffer'
import { Texture, TextureAddressingMode } from './texture'
import { Color } from './color'

enum ClippingFace {
  Front = 0,
  Back = 1,
  Left = 2,
  Right = 3,
  Top = 4,
  Bottom = 5
}

const DEFAULT_MAX_DEPTH = 100
const DEFAULT_MIN_DEPTH = 1

export class PipelineSettings {
  texture?: Texture
  textureMode = TextureAddressingMode.Clamp
  ignoreDepth = false
  light?: Light
  shininess?: number

  clone() {
    const clone = new PipelineSettings()
    clone.texture = this.texture
    clone.textureMode = this.textureMode
    clone.ignoreDepth = this.ignoreDepth
    clone.light = this.light
    clone.shininess = this.shininess
    return clone
  }
}

export class Pipeline {
  // Transformations and settings
  view = Matrix.withIdentity()
  worldView = Matrix.withIdentity()
  projection = Matrix.withIdentity()
  screenTransform = Matrix.withIdentity()
  streams: Stream[] = []
  light?: Light
  shininess = 0

  // Calculated view space position (or light direction)
  cameraViewPosition = new Vector3(0, 0, 0)
  lightViewVector = new Vector3(0, 0, 0)

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

  clipTest = {
    [ClippingFace.Front]: (vert: Vertex) => vert.pos.z >= this.minDepth,
    [ClippingFace.Back]: (vert: Vertex) => vert.pos.z <= this.maxDepth,
    [ClippingFace.Left]: (vert: Vertex) => vert.pos.x >= -vert.pos.z,
    [ClippingFace.Right]: (vert: Vertex) => vert.pos.x <= vert.pos.z,
    [ClippingFace.Top]: (vert: Vertex) => vert.pos.y >= -vert.pos.z,
    [ClippingFace.Bottom]: (vert: Vertex) => vert.pos.y <= vert.pos.z
  }

  clipInterpolation = {
    [ClippingFace.Front]: (a: Vector3, b: Vector3) => (this.minDepth - a.z) / (b.z - a.z),
    [ClippingFace.Back]: (a: Vector3, b: Vector3) => (a.z - this.maxDepth) / (a.z - b.z),
    [ClippingFace.Left]: (a: Vector3, b: Vector3) => (-a.z - a.x) / (-a.z - a.x + b.x + b.z),
    [ClippingFace.Right]: (a: Vector3, b: Vector3) => (a.z - a.x) / (a.z - a.x + b.x - b.z),
    [ClippingFace.Top]: (a: Vector3, b: Vector3) => (-a.z - a.y) / (-a.z - a.y + b.y + b.z),
    [ClippingFace.Bottom]: (a: Vector3, b: Vector3) => (a.z - a.y) / (a.z - a.y + b.y - b.z)
  }

  // Metadata / Other
  frameRate = 0
  framerateReadoutId = ''

  constructor(renderCanvasId: string) {
    this.screenTarget = Target.withCanvasElementId(renderCanvasId)
    this.width = this.screenTarget.canvas.width
    this.height = this.screenTarget.canvas.height
    this.renderTarget = Target.withDimensions(this.width, this.height)
    this.frameBuffer = this.renderTarget.buffer
    this.depthBuffer = new DepthBuffer(this.width, this.height, this.maxDepth, this.minDepth)
    this.rasterizer = new Rasterizer(this.frameBuffer, this.depthBuffer)

    const w = this.width / 2.0
    const h = this.height / 2.0

    // (-0.5, -0.5) shift, addresses jittery pixels along top/left from clipped triangles.
    this.screenTransform = Matrix.translationWithXYZ(w - 0.5, h - 0.5, 0).multiplyMatrix(
      Matrix.scaleWithXYZ(w, -h, 1)
    )
  }

  beginLoop(loop: () => void, vsync = true) {
    const frameData = { count: 0, time: performance.now() }
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
    far && ((this.maxDepth = far), (this.depthBuffer.maxDepth = far))
    near && ((this.minDepth = near), (this.depthBuffer.minDepth = near))
  }

  updateFrameRate(frameData: { count: number; time: number }) {
    if (!this.framerateReadoutId) return
    const now = performance.now()
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

  applySettings(settings: PipelineSettings) {
    this.rasterizer.setTexture(settings.texture)
    Texture.mode = settings.textureMode ?? TextureAddressingMode.Clamp
    this.light = settings.light ?? this.light
    this.shininess = settings.shininess ?? this.shininess
    this.depthBuffer.skip = settings.ignoreDepth

    if (this.light?.illuminatesVertices) {
      const vc = this.view.column(3)
      this.cameraViewPosition = new Vector3(-vc.x, -vc.y, -vc.z)

      if (this.light.position) {
        this.lightViewVector = this.view.multiplyVector(Vector4.withPosition(this.light.position))
      } else {
        this.lightViewVector = this.view
          .multiplyVector(Vector4.withDirection(this.light.direction!))
          .normalize()
          .negate()
      }
    }
  }

  draw() {
    // Cache global settings to replace when a stream overrides them
    const defaultShininess = this.shininess
    const defaultLight = this.light
    this.streams.forEach((stream) => {
      this.applySettings(stream.settings)
      this.worldView = Matrix.multiply(this.view, stream.worldMatrix)

      stream.primitives.forEach((p) => {
        p.vertices.forEach((v) => {
          this.transformAndLight(v)
        })
        this.triangulateClipTargetMapAndRasterize(p)
      })
      this.shininess = defaultShininess
      this.light = defaultLight
    })
  }

  transformAndLight(vert: Vertex) {
    vert.pos = this.worldView.multiplyVector(Vector4.withPosition(vert.pos))

    if (this.light) {
      let lightDiff = Color.withWhite()
      let lightSpec = Color.withBlack()

      if (this.light.illuminatesVertices) {
        vert.nrm = this.worldView.multiplyVector(Vector4.withDirection(vert.nrm)).normalize()
        const vertexToLight = this.light.direction
          ? this.lightViewVector
          : Vector3.subtract(this.lightViewVector, vert.pos).normalize()
        const vertexToCamera = Vector3.subtract(this.cameraViewPosition, vert.pos).normalize()

        const intensity = Math.max(0, vertexToLight.dot(vert.nrm))
        lightDiff = (this.light.diffuse?.clone() ?? lightDiff).scale(intensity)

        if (this.light.specular) {
          const betweenLightAndCamera = vertexToLight.add(vertexToCamera).normalize()
          const specularIntensity = Math.max(0, betweenLightAndCamera.dot(vert.nrm))
          const weirdMakeHighlightLookGoodNonsense =
            specularIntensity /
            (this.shininess - this.shininess * specularIntensity + specularIntensity)
          lightSpec = this.light.specular.clone().scale(weirdMakeHighlightLookGoodNonsense)
        }
      }

      vert.diff.multiply(lightDiff)
      vert.spec.multiply(lightSpec)
      this.light.ambient && vert.diff.add(this.light.ambient)
      this.light.emissive && vert.spec.add(this.light.emissive)
      vert.diff.clamp(1)
      vert.spec.clamp(1)
    }

    vert.pos = this.projection.multiplyVector(Vector4.withPosition(vert.pos))
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
      // Clip triangle here (possibly generates more triangles)
      const clipped = this.clipTriangles([tri])

      clipped.forEach((clippedTri) => {
        clippedTri.forEach((vert) => {
          vert.pos.x /= vert.pos.z
          vert.pos.y /= vert.pos.z
          vert.pos.z = 1 / vert.pos.z
          vert.tex.scale(vert.pos.z)
          vert.pos = this.screenTransform.multiplyVector(Vector4.withPosition(vert.pos))
        })

        // Ideally this would come before clipping, but since I didn't manage to get
        // clipping working outside of view space... here it is it doesn't work before
        // the perspective divide, because flattening can change screen order of verts
        Pipeline.counterClockwise(clippedTri) && this.rasterizer.triangleDraw(clippedTri)
      })
    })
  }

  static counterClockwise = (triangle: Vertex[]) => {
    const pos = triangle.map((vert) => vert.pos)
    return (
      (pos[1].x - pos[0].x) * (pos[2].y - pos[1].y) +
        (pos[1].y - pos[0].y) * (pos[1].x - pos[2].x) <
      0
    )
  }

  // Recursively clip triangles against every edge of the normalized view frustum
  clipTriangles(triangles: Vertex[][], face = ClippingFace.Front): Vertex[][] {
    const clippedTriangles: Vertex[][] = []

    triangles.forEach((tri) => {
      const inside: number[] = []

      tri.forEach((vert, i) => {
        this.clipTest[face](vert) && inside.push(i)
      })

      if (!inside.length) {
        return
      } else if (inside.length === 3) {
        clippedTriangles.push(tri)
      } else {
        clippedTriangles.push(...this.generateClipped(tri, inside, face))
      }
    })

    return face === ClippingFace.Bottom || !clippedTriangles.length
      ? clippedTriangles
      : this.clipTriangles(clippedTriangles, face + 1)
  }

  generateClipped(tri: Vertex[], inside: number[], face: ClippingFace) {
    // Clip triangles: need to maintain vertex order, because we haven't
    // performed backface culling as we aren't in screen space yet.
    const out: Vertex[] = []
    tri.forEach((v, i) => {
      if (inside.includes(i)) {
        out.push(v)
      } else {
        const prevAndNext = [(i + 2) % 3, (i + 1) % 3]
        prevAndNext.forEach((idx) => {
          if (!inside.includes(idx)) return
          const t = this.clipInterpolation[face](v.pos, tri[idx].pos)
          out.push(Vertex.interpolate(v, tri[idx], t))
        })
      }
    })

    if (out.length === 3) return [out]

    return [
      [out[0], out[1], out[2]],
      [out[2].clone(), out[3], out[0].clone()]
    ]
  }
}
