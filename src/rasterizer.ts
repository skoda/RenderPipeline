import Color from './color'
import Target from './target'
import { Texture, TextureCoord } from './texture'
import Vector2 from './vector2'
import Vector3 from './vector3'
import Vertex from './vertex'

export default class Rasterizer {
  buffer: Uint8ClampedArray
  texture?: Texture
  width: number
  height: number
  curIdx: number

  constructor(target: Target) {
    const { data, width, height } = target.buffer
    this.buffer = data
    this.width = width
    this.height = height
    this.curIdx = 0
  }

  setTexture(texture: Texture) {
    this.texture = texture
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

  lineDraw(a: Vector2, b: Vector2, aColor: Color, bColor: Color) {
    const pos = a.clone()
    const col = aColor.clone()
    const length = Math.round(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)))
    const step = Vector2.subtract(b, a).scale(1 / length)
    const colStep = Color.subtract(bColor, aColor).scale(1 / length)

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
    const mt = TextureCoord.subtract(r.tex, l.tex)
    const diff = l.diff.clone().scale(256)
    const spec = l.spec.clone().scale(256)
    const mdiff = Color.subtract(r.diff, l.diff).scale(256 / width)
    const mspec = Color.subtract(r.diff, l.diff).scale(256 / width)

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

    //Color objects to minimize object allocations in inner loop
    const color = Color.withBlack()

    //Draw Scanline
    while (x++ <= xEnd) {
      if (this.texture) {
        this.texture.sample(t.clone().scale(1 / z), color)
        t.add(mt)
        z += mz
      } else {
        color.r = color.g = color.b = 1.0
      }

      color.multiply(diff).add(spec)
      this.nextPixel(Math.floor(color.r), Math.floor(color.g), Math.floor(color.b))
    }
  }

  triangleDraw(vtx: Vertex[]) {
    const left = vtx[0].clone() // Current left edge vertex
    const right = vtx[0].clone() // Current right edge vertex
    const mMid = vtx[0].clone() // rate of change top triangle half
    const mBot = vtx[0].clone() // rate of change bottom triangle half

    //Order Vertex Indices
    const iTop = [0, 1, 2].reduce((a, c) => (vtx[a].pos.y < vtx[c].pos.y ? a : c))
    const iBot = [0, 1, 2].reduce((a, c) => (vtx[a].pos.y > vtx[c].pos.y ? a : c))
    const top = vtx[iTop]
    const bot = vtx[iBot]
    const mid = vtx[3 - (iTop + iBot)]

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
    const yMid = Math.ceil(mid.pos.y) - 1
    const yEnd = Math.ceil(bot.pos.y) - 1
    const midHeight = mid.pos.y - top.pos.y
    const height = bot.pos.y - top.pos.y

    mMid.pos = Vector3.subtract(mid.pos, top.pos).scale(1 / midHeight)
    mBot.pos = Vector3.subtract(bot.pos, top.pos).scale(1 / height)

    if (this.texture) {
      const { width: tw, height: th } = this.texture
      top.tex.scale(top.pos.z)
      mid.tex.scale(mid.pos.z)
      bot.tex.scale(bot.pos.z)
      mMid.tex = mid.tex
        .subtract(top.tex)
        .multiply(TextureCoord.withUV(tw / midHeight, th / midHeight))
      mBot.tex = bot.tex.subtract(top.tex).multiply(TextureCoord.withUV(tw / height, th / height))
    }

    mMid.diff = Color.subtract(mid.diff, top.diff).scale(1 / midHeight)
    mMid.spec = Color.subtract(mid.spec, top.spec).scale(1 / midHeight)
    mBot.diff = Color.subtract(bot.diff, top.diff).scale(1 / height)
    mBot.spec = Color.subtract(bot.spec, top.spec).scale(1 / height)
    /////////////////////////////////

    //Initialize vertices
    let initDiff = y - vtx[Top].pos.y
    Left.pos.x = vtx[Top].pos.x + ml.pos.x * initDiff
    Left.pos.z = vtx[Top].pos.z + ml.pos.z * initDiff
    let tmp = ml.diff.clone()
    tmp.scale(initDiff)
    Left.diff = col_add(vtx[Top].diff, tmp)
    tmp = ml.spec.clone()
    tmp.scale(initDiff)
    Left.spec = col_add(vtx[Top].spec, tmp)
    Left.tex.u = vtx[Top].pos.z * vtx[Top].tex.u * t_width + ml.tex.u * initDiff
    Left.tex.v = vtx[Top].pos.z * vtx[Top].tex.v * t_height + ml.tex.v * initDiff

    Right.pos.x = vtx[Top].pos.x + mr.pos.x * initDiff
    Right.pos.z = vtx[Top].pos.z + mr.pos.z * initDiff
    tmp = mr.diff.clone()
    tmp.scale(initDiff)
    Right.diff = col_add(vtx[Top].diff, tmp)
    tmp = mr.spec.clone()
    tmp.scale(initDiff)
    Right.spec = col_add(vtx[Top].spec, tmp)
    Right.tex.u = vtx[Top].pos.z * vtx[Top].tex.u * t_width + mr.tex.u * initDiff
    Right.tex.v = vtx[Top].pos.z * vtx[Top].tex.v * t_height + mr.tex.v * initDiff
    /////////////////////////////////

    let yStop = yMid
    for (let i = 0; i < 2; ++i) {
      //Draw Triangle Half
      while (y <= yStop) {
        if (y >= 0 && y < frameBuffer.height) SCANLINE_DRAW(y, Left, Right)

        Left.diff.add_eq(ml.diff)
        Left.spec.add_eq(ml.spec)
        Left.pos.x += ml.pos.x
        Left.pos.z += ml.pos.z
        Left.tex.u += ml.tex.u
        Left.tex.v += ml.tex.v

        Right.diff.add_eq(mr.diff)
        Right.spec.add_eq(mr.spec)
        Right.pos.x += mr.pos.x
        Right.pos.z += mr.pos.z
        Right.tex.u += mr.tex.u
        Right.tex.v += mr.tex.v

        ++y
      }
      /////////////////////////////////

      if (i == 0) {
        yStop = yEnd

        //Reset Interpolation Values
        height -= midHeight

        mMid.pos.x = (vtx[Bot].pos.x - vtx[Mid].pos.x) / height
        mMid.pos.z = (vtx[Bot].pos.z - vtx[Mid].pos.z) / height
        mMid.tex.u =
          (t_width * (vtx[Bot].tex.u * vtx[Bot].pos.z - vtx[Mid].tex.u * vtx[Mid].pos.z)) / height
        mMid.tex.v =
          (t_height * (vtx[Bot].tex.v * vtx[Bot].pos.z - vtx[Mid].tex.v * vtx[Mid].pos.z)) / height
        mMid.diff = col_add(vtx[Bot].diff, vtx[Mid].diff.negate())
        mMid.diff.scale(1 / height)
        mMid.spec = col_add(vtx[Bot].spec, vtx[Mid].spec.negate())
        mMid.spec.scale(1 / height)
        /////////////////////////////////

        //Reset Middle Vertex
        initDiff = y - vtx[Mid].pos.y
        mp.pos.x = vtx[Mid].pos.x + initDiff * mMid.pos.x
        mp.pos.z = vtx[Mid].pos.z + initDiff * mMid.pos.z
        tmp = mMid.diff.clone()
        tmp.scale(initDiff)
        mp.diff = col_add(vtx[Mid].diff, tmp)
        tmp = mMid.spec.clone()
        tmp.scale(initDiff)
        mp.spec = col_add(vtx[Mid].spec, tmp)
        mp.tex.u = vtx[Mid].pos.z * vtx[Mid].tex.u * t_width + initDiff * mMid.tex.u
        mp.tex.v = vtx[Mid].pos.z * vtx[Mid].tex.v * t_height + initDiff * mMid.tex.v
        /////////////////////////////////
      }
    }
  }
}
