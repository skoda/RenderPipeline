import { Matrix } from '../math'
import Texture from '../texture'
import { Vertex } from '../vertex'

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
  worldMatrix: Matrix = Matrix.withIdentity()
  texture?: Texture

  addPrimitive(primitive: Primitive, clone = true) {
    this.primitives.push(clone ? primitive.clone() : primitive)
  }

  async loadTexture(url: string) {
    this.texture = await Texture.withURL(url)
  }

  clone() {
    const clone = new Stream()
    clone.texture = this.texture
    clone.worldMatrix = this.worldMatrix.clone()
    clone.primitives = this.primitives.map((p) => p.clone())
    return clone
  }
}
