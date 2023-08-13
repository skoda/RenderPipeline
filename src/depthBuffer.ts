export class DepthBuffer {
  buffer: Uint16Array
  width: number
  height: number
  curIdx = 0

  constructor(width: number, height: number) {
    this.buffer = new Uint16Array(width * height)
    this.width = width
    this.height = height
    this.clear
  }

  setIndex(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false
    this.curIdx = y * this.width + x
  }

  next(depth: number) {
    const idx = this.curIdx++

    // Shouldn't need this after clipping
    if (depth < 0) return false

    // depth should be 0-1 (after clipping), map to uint16
    const z = Math.floor(depth * 65535)

    if (z > this.buffer[idx]) return false
    this.buffer[idx] = z
    return true
  }

  clear() {
    this.buffer.fill(65535)
  }
}
