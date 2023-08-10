import clamp from './clamp'
import Color from './color'
import Vector from './vector'

export class TextureCoord extends Vector {
  get u() {
    return this[0]
  }
  set u(u: number) {
    this[0] = u
  }

  get v() {
    return this[1]
  }
  set v(v: number) {
    this[1] = v
  }

  private constructor(values: number[]) {
    super(values)
  }

  clone() {
    return new TextureCoord(this)
  }

  static withUV(u: number, v: number) {
    return new TextureCoord([u, v])
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
