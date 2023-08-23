import { Matrix } from '../math/index.js'
import { PipelineSettings } from '../pipeline/index.js'
import { Texture, Vertex } from '../rasterization/index.js'

export enum VertexPattern {
  List,
  Fan,
  Strip
}

export class Primitive {
  pattern: VertexPattern
  vertices: Vertex[]

  constructor(pattern: VertexPattern, vertices: Vertex[], clone = true) {
    this.pattern = pattern
    this.vertices = clone ? vertices.map((v) => v.clone()) : vertices
  }

  clone() {
    return new Primitive(this.pattern, this.vertices, true)
  }
}

export class Stream {
  primitives: Primitive[] = []
  worldMatrix = Matrix.withIdentity()
  settings = new PipelineSettings()

  addPrimitive(primitive: Primitive, clone = true) {
    this.primitives.push(clone ? primitive.clone() : primitive)
  }

  async loadTexture(url: string) {
    this.settings.texture = await Texture.withURL(url)
  }

  clone() {
    const clone = new Stream()
    clone.settings = this.settings.clone()
    clone.worldMatrix = this.worldMatrix.clone()
    clone.primitives = this.primitives.map((p) => p.clone())
    return clone
  }
}
