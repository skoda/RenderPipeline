import Target from './target'

export default class Rasterizer {
  buffer: Uint8ClampedArray
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

  setBufferIndex(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false
    this.curIdx = (y * this.width + x) * 4
  }

  setPixel(x: number, y: number, r: number, g: number, b: number) {
    if (this.setBufferIndex(x, y) !== false) this.nextPixel(r, g, b)
  }

  nextPixel(r: number, g: number, b: number) {
    this.buffer[this.curIdx++] = r
    this.buffer[this.curIdx++] = g
    this.buffer[this.curIdx++] = b
    this.buffer[this.curIdx++] = 255
  }
}
