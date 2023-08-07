import { Light } from './light'
import Matrix from './matrix'
import Target from './target'
import { Texture } from './texture'
import Vertex from './vertex'

export default class Pipeline {
  world: Matrix
  view: Matrix
  projection: Matrix
  stream: Vertex[]
  light?: Light
  texture?: Texture
  shininess: number

  width: number
  height: number

  screenTarget: Target
  renderTarget: Target
  frameBuffer: ImageData

  constructor(renderCanvasId: string) {
    this.world = Matrix.withIdentity()
    this.view = Matrix.withIdentity()
    this.projection = Matrix.withIdentity()
    this.stream = []
    this.shininess = 0

    this.screenTarget = Target.withCanvasElementId(renderCanvasId)
    this.width = this.screenTarget.canvas.width
    this.height = this.screenTarget.canvas.height
    this.renderTarget = Target.withDimensions(this.width, this.height)
  }

  clear() {
    this.renderTarget.context.fillStyle = 'rgb(0, 0, 0)'
    this.renderTarget.context.fillRect(0, 0, this.width, this.height)
    this.frameBuffer = this.renderTarget.buffer
  }

  present() {
    this.renderTarget.buffer = this.frameBuffer
    this.screenTarget.context.drawImage(this.renderTarget.canvas, 0, 0, this.width, this.height)
    this.clear()
  }
}
