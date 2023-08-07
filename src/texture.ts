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

export class Texture {
  data: ImageData

  static cache: Record<string, Texture>

  static async withURL(url: string): Promise<Texture> {
    if (Texture.cache[url]) return Texture.cache[url]

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
        const data = context.getImageData(0, 0, width, height)
        return resolve(new Texture(data))
      }
    })
  }

  private constructor(data: ImageData) {
    this.data = data
  }
}
