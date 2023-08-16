import { Color } from './color'
import Texture, { TextureCoord } from './texture'
import { Vector2, Vector3 } from './math'
import { Vertex } from './vertex'
import { DepthBuffer } from './depthBuffer'

export default class Rasterizer {
  buffer: Uint8ClampedArray
  depthBuffer: DepthBuffer
  width: number
  height: number
  texture?: Texture
  curIdx: number

  constructor(frameBuffer: ImageData, depthBuffer: DepthBuffer) {
    const { data: buffer, width, height } = frameBuffer
    this.buffer = buffer
    this.depthBuffer = depthBuffer
    this.width = width
    this.height = height
    this.curIdx = 0
  }

  setFrameBuffer(frameBuffer: ImageData) {
    const { data: buffer, width, height } = frameBuffer
    this.buffer = buffer
    this.width = width
    this.height = height
  }

  setTexture(texture?: Texture) {
    this.texture = texture
  }

  clearTexture() {
    this.texture = undefined
  }

  setPixel(x: number, y: number, r: number, g: number, b: number) {
    if (this.setBufferIndex(x, y) !== false) this.nextPixel(r, g, b)
  }

  setBufferIndex(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false
    this.curIdx = (y * this.width + x) * 4
  }

  nextPixel(r: number, g: number, b: number) {
    this.buffer[this.curIdx++] = r
    this.buffer[this.curIdx++] = g
    this.buffer[this.curIdx++] = b
    this.buffer[this.curIdx++] = 255
  }

  lineDraw(a: Vector2, b: Vector2, aColor = Color.withWhite(), bColor = Color.withWhite()) {
    const pos = a.clone()
    const col = aColor.clone().scale(256)
    const length = Math.round(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)))
    const step = Vector2.subtract(b, a).scale(1 / length)
    const colStep = Color.subtract(bColor, aColor).scale(256 / length)

    for (let i = 0; i < length; ++i) {
      this.setPixel(Math.round(pos.x), Math.round(pos.y), col.r, col.g, col.b)
      pos.add(step)
      col.add(colStep)
    }
  }

  scanlineDraw(y: number, l: Vertex, r: Vertex) {
    let x = Math.ceil(l.pos.x)
    const xEnd = Math.min(Math.ceil(r.pos.x), this.width) - 1
    const width = r.pos.x - l.pos.x

    // Setup interpolants
    let z = l.pos.z // actually 1/z, which properly interpolates
    const mz = (r.pos.z - l.pos.z) / width
    const t = l.tex.clone()
    const mt = TextureCoord.subtract(r.tex, l.tex).scale(1 / width)
    const diff = l.diff.clone().scale(256)
    const spec = l.spec.clone().scale(256)
    const mdiff = Color.subtract(r.diff, l.diff).scale(256 / width)
    const mspec = Color.subtract(r.spec, l.spec).scale(256 / width)

    // Shift initial values by ceil() offset to ensure sub-pixel accuracy
    let initialDiff = x - l.pos.x
    if (x < 0) {
      // Also clamp x to start within the buffer, we should clip in
      // earlier pipeline stages to guarantee this
      initialDiff += -x
      x = 0
    }
    z += mz * initialDiff
    t.add(mt.clone().scale(initialDiff))
    diff.add(mdiff.clone().scale(initialDiff))
    spec.add(mspec.clone().scale(initialDiff))

    //Initialize index for nextPixel
    this.setBufferIndex(x, y)
    this.depthBuffer.setIndex(x, y)

    //Color objects to minimize object allocations in inner loop
    const color = Color.withBlack()

    //Draw Scanline
    while (x++ <= xEnd) {
      const depth = 1 / z
      const pass = true //this.depthBuffer.next(depth)

      if (this.texture) {
        pass && this.texture.sample(t.clone().scale(depth), color)
        t.add(mt)
        z += mz
      } else {
        color.r = color.g = color.b = 1.0
      }

      if (pass) {
        color.multiply(diff).add(spec)
        this.nextPixel(Math.floor(color.r), Math.floor(color.g), Math.floor(color.b))
      } else {
        this.curIdx += 4
      }

      diff.add(mdiff)
      spec.add(mspec)
    }
  }

  triangleDraw(vtx: Vertex[]) {
    const left = vtx[0].clone() // Current left edge vertex
    const right = vtx[0].clone() // Current right edge vertex
    const mMid = vtx[0].clone() // rate of change top triangle half
    const mBot = vtx[0].clone() // rate of change bottom triangle half

    //Order Vertex Indices
    const topIdx = [0, 1, 2].reduce((a, c) => (vtx[a].pos.y < vtx[c].pos.y ? a : c))
    const botIdx = [0, 1, 2].reduce((a, c) => (vtx[a].pos.y > vtx[c].pos.y ? a : c))
    const top = vtx[topIdx]
    const bot = vtx[botIdx]
    const mid = vtx[3 - (topIdx + botIdx)]

    //Setup Left/Right Vertex Indices
    let ml: Vertex //
    let mr: Vertex
    let mp: Vertex
    if (
      (top.pos.y - mid.pos.y) * (bot.pos.x - top.pos.x) +
        (mid.pos.x - top.pos.x) * (bot.pos.y - top.pos.y) <
      0
    ) {
      // Left edge goes from Top to Mid, Right edge from Top to Bot
      ml = mMid
      mr = mBot
      mp = left
    } else {
      // Left edge goes from Top to Bot, Right edge from Top to Mid
      ml = mBot
      mr = mMid
      mp = right
    }
    /////////////////////////////////

    //Setup Interpolation Values
    let y = Math.ceil(top.pos.y)
    let offset = y - top.pos.y
    const yMid = Math.ceil(mid.pos.y) - 1
    const yEnd = Math.ceil(bot.pos.y) - 1
    const invMidHeight = 1 / (mid.pos.y - top.pos.y)
    let invHeight = 1 / (bot.pos.y - top.pos.y)

    mMid.pos = Vector3.subtract(mid.pos, top.pos).scale(invMidHeight)
    mBot.pos = Vector3.subtract(bot.pos, top.pos).scale(invHeight)

    if (this.texture) {
      const txSize = new TextureCoord(this.texture.width, this.texture.height)
      top.tex.multiply(txSize)
      mid.tex.multiply(txSize)
      bot.tex.multiply(txSize)
      mMid.tex = TextureCoord.subtract(mid.tex, top.tex).scale(invMidHeight)
      mBot.tex = TextureCoord.subtract(bot.tex, top.tex).scale(invHeight)
      left.tex = ml.tex.clone().scale(offset).add(top.tex)
      right.tex = mr.tex.clone().scale(offset).add(top.tex)
    }

    mMid.diff = Color.subtract(mid.diff, top.diff).scale(invMidHeight)
    mMid.spec = Color.subtract(mid.spec, top.spec).scale(invMidHeight)
    mBot.diff = Color.subtract(bot.diff, top.diff).scale(invHeight)
    mBot.spec = Color.subtract(bot.spec, top.spec).scale(invHeight)
    /////////////////////////////////

    //Initialize edge vertices
    left.pos = ml.pos.clone().scale(offset).add(top.pos)
    left.diff = ml.diff.clone().scale(offset).add(top.diff)
    left.spec = ml.spec.clone().scale(offset).add(top.spec)

    right.pos = mr.pos.clone().scale(offset).add(top.pos)
    right.diff = mr.diff.clone().scale(offset).add(top.diff)
    right.spec = mr.spec.clone().scale(offset).add(top.spec)
    /////////////////////////////////

    let yStop = yMid
    for (let i = 0; i < 2; ++i) {
      //Draw Triangle Half
      while (y <= yStop) {
        if (y >= 0 && y < this.height) this.scanlineDraw(y, left, right)

        left.pos.add(ml.pos)
        right.pos.add(mr.pos)
        left.diff.add(ml.diff)
        right.diff.add(mr.diff)
        left.spec.add(ml.spec)
        right.spec.add(mr.spec)
        if (this.texture) {
          left.tex.add(ml.tex)
          right.tex.add(mr.tex)
        }

        ++y
      }
      /////////////////////////////////

      if (i == 0) {
        yStop = yEnd

        //Reset Interpolation Values
        invHeight = 1 / (bot.pos.y - mid.pos.y)
        mMid.pos = Vector3.subtract(bot.pos, mid.pos).scale(invHeight)
        mMid.tex = TextureCoord.subtract(bot.tex, mid.tex).scale(invHeight)
        mMid.diff = Color.subtract(bot.diff, mid.diff).scale(invHeight)
        mMid.spec = Color.subtract(bot.spec, mid.spec).scale(invHeight)
        /////////////////////////////////

        //Reset Middle Vertex
        offset = y - mid.pos.y
        mp.pos = mMid.pos.clone().scale(offset).add(mid.pos)
        mp.diff = mMid.diff.clone().scale(offset).add(mid.diff)
        mp.spec = mMid.spec.clone().scale(offset).add(mid.spec)

        if (this.texture) {
          mp.tex = mMid.tex.clone().scale(offset).add(mid.tex)
        }
        /////////////////////////////////
      }
    }
  }
}
