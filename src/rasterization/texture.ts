import { clamp } from '../math/index.js'
import { Color } from './color.js'

export enum TextureAddressingMode {
  Clamp,
  Wrap,
  Mirror
}

export enum TextureSamplingMode {
  Point,
  Linear
}

export class TextureCoord {
  u: number
  v: number

  constructor(u: number, v: number) {
    this.u = u
    this.v = v
  }

  clone() {
    return new TextureCoord(this.u, this.v)
  }

  static add(l: TextureCoord, r: TextureCoord) {
    return l.clone().add(r)
  }

  static subtract(l: TextureCoord, r: TextureCoord) {
    return l.clone().subtract(r)
  }

  static multiply(l: TextureCoord, r: TextureCoord) {
    return l.clone().multiply(r)
  }

  assign(t: TextureCoord) {
    this.u = t.u
    this.v = t.v
    return this
  }

  scale(s: number) {
    this.u *= s
    this.v *= s
    return this
  }

  negate() {
    this.u = -this.u
    this.v = -this.v
    return this
  }

  add(coord: TextureCoord) {
    this.u += coord.u
    this.v += coord.v
    return this
  }

  subtract(coord: TextureCoord) {
    this.u -= coord.u
    this.v -= coord.v
    return this
  }

  multiply(coord: TextureCoord) {
    this.u *= coord.u
    this.v *= coord.v
    return this
  }
}

export class Texture {
  data: number[]
  width: number
  height: number

  sample(coord: TextureCoord, out: Color) {
    Texture.sampleMethod(this, coord, out)
  }

  static cache: Record<string, Texture> = {}

  static addressMethod: (c: number, d: number) => number
  static sampleMethod: (tex: Texture, coord: TextureCoord, out: Color) => void

  static async withURL(url: string): Promise<Texture> {
    if (this.cache[url]) return this.cache[url]

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const { width, height } = img
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')

        if (!context) return reject("Couldn't get canvas context for loading texture.")

        context.drawImage(img, 0, 0)
        const imageData = context.getImageData(0, 0, width, height)
        const texture = new Texture(imageData)
        Texture.cache[url] = texture
        return resolve(texture)
      }
      img.src = url
    })
  }

  private constructor(imageData: ImageData) {
    const { data, width, height } = imageData
    this.data = new Array(3 * width * height)

    const len = 4 * width * height
    // Normalize data to color values used when reading to
    // prevent additional divides per pixel when sampling
    for (let i = 0, j = 0; i < len; ++i) {
      this.data[j++] = data[i++] / 255
      this.data[j++] = data[i++] / 255
      this.data[j++] = data[i++] / 255
    }

    // Object.seal(this.data)
    this.width = width
    this.height = height
  }

  static set textureAddressingMode(val: TextureAddressingMode) {
    const methods = {
      [TextureAddressingMode.Clamp]: (c: number, d: number) => clamp(~~c, d - 1),
      [TextureAddressingMode.Wrap]: (c: number, d: number) => {
        c = ~~c % d
        return c < 0 ? c + d : c
      },
      [TextureAddressingMode.Mirror]: (c: number, d: number) => {
        c = Math.abs(~~c) % (d + d)
        return c < d ? c : d + d - c - 1
      }
    }
    Texture.addressMethod = methods[val]
  }

  static set textureSamplingMode(val: TextureSamplingMode) {
    const methods = {
      [TextureSamplingMode.Point]: (tex: Texture, coord: TextureCoord, out: Color) => {
        const u = Texture.addressMethod(coord.u, tex.width)
        const v = Texture.addressMethod(coord.v, tex.height)

        let i = (v * tex.width + u) * 3
        out.r = tex.data[i++]
        out.g = tex.data[i++]
        out.b = tex.data[i]
      },
      [TextureSamplingMode.Linear]: (tex: Texture, { u, v }: TextureCoord, out: Color) => {
        let ul = [u - 0.5, u + 0.5]
        let vl = [v - 0.5, v + 0.5]
        const u0scale = ~~ul[1] - ul[0]
        const u1scale = 1 - u0scale
        const v0scale = ~~vl[1] - vl[0]
        const v1scale = 1 - v0scale
        ul = ul.map((u) => Texture.addressMethod(u, tex.width))
        vl = vl.map((v) => Texture.addressMethod(v, tex.height))

        const coords = [
          [ul[0], vl[0], u0scale * v0scale],
          [ul[0], vl[1], u0scale * v1scale],
          [ul[1], vl[0], u1scale * v0scale],
          [ul[1], vl[1], u1scale * v1scale]
        ]
        out.r = out.g = out.b = 0

        coords.forEach(([u, v, scale]) => {
          let i = (v * tex.width + u) * 3
          out.r += tex.data[i++] * scale
          out.g += tex.data[i++] * scale
          out.b += tex.data[i] * scale
        })
      }
    }
    Texture.sampleMethod = methods[val]
  }
}
