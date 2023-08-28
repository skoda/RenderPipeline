import { clamp } from '../math/index.js'
import { Color } from './color.js'

export enum TextureAddressingMode {
  Clamp,
  Wrap,
  Mirror
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

  static cache: Record<string, Texture> = {}
  static mode = TextureAddressingMode.Clamp

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

  static addressingMethod = {
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

  sample(coord: TextureCoord, out: Color) {
    const method = Texture.addressingMethod[Texture.mode]
    const u = method(coord.u, this.width)
    const v = method(coord.v, this.height)

    let i = (v * this.width + u) * 3
    out.r = this.data[i++]
    out.g = this.data[i++]
    out.b = this.data[i]
  }
}
