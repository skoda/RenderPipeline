export class DepthBuffer {
  buffer: Uint16Array
  width: number
  height: number
  MAX: number
  _maxDepth = 1
  _minDepth = 0
  _scale = 1
  curIdx = 0
  skip = false

  set minDepth(value: number) {
    this._minDepth = value
    this._scale = this.MAX / (this._maxDepth - this._minDepth)
  }

  set maxDepth(value: number) {
    this._maxDepth = value
    this._scale = this.MAX / (this._maxDepth - this._minDepth)
  }

  constructor(width: number, height: number, maxDepth: number, minDepth: number) {
    this.buffer = new Uint16Array(width * height)
    this.buffer[0] = -1 // This will give the max unsigned value
    this.MAX = this.buffer[0] // Store it for other calculations
    this.width = width
    this.height = height
    this._maxDepth = maxDepth
    this.minDepth = minDepth // intentionally trigger setter
    this.clear()
  }

  setIndex(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false
    this.curIdx = y * this.width + x
  }

  next(depth: number) {
    const idx = this.curIdx++
    if (this.skip) return true
    const z = Math.floor((depth - this._minDepth) * this._scale)

    if (z > this.buffer[idx]) return false
    this.buffer[idx] = z
    return true
  }

  clear() {
    this.buffer.fill(this.MAX)
  }
}
