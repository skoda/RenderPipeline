export class Target {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D

  get buffer() {
    const { width, height } = this.canvas
    return this.context.getImageData(0, 0, width, height)
  }

  set buffer(data: ImageData) {
    this.context.putImageData(data, 0, 0)
  }

  private constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Unable to get context for canvas!')

    this.canvas = canvas
    this.context = context
  }

  static withCanvasElementId(id: string) {
    return new Target(document.getElementById(id) as HTMLCanvasElement)
  }

  static withDimensions(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return new Target(canvas)
  }
}
