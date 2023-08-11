import clamp from './clamp'
import Color from './color'

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

export default class Texture {
  data: Uint8ClampedArray
  width: number
  height: number

  static cache: Record<string, Texture> = {}

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
    this.data = data
    this.width = width
    this.height = height
  }

  sample(coord: TextureCoord, out: Color) {
    const u = clamp(Math.round(coord.u), this.width - 1)
    const v = clamp(Math.round(coord.v), this.height - 1)

    let i = (v * this.width + u) * 4

    out.r = this.data[i++] / 255
    out.g = this.data[i++] / 255
    out.b = this.data[i] / 255
  }
}
