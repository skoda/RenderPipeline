import { Matrix } from '../math'
import Texture from '../texture'
import { Vertex } from '../vertex'

enum VertexPattern {
  List,
  Fan,
  Strip
}

export class Triangles {
  pattern: VertexPattern
  vertices: Vertex[]

  constructor(pattern: VertexPattern, vertices: Vertex[], clone = true) {
    this.pattern = pattern
    this.vertices = clone ? vertices.map((v) => v.clone()) : vertices
  }

  clone() {
    return new Triangles(this.pattern, this.vertices, true)
  }
}

export class Stream {
  trianglesList: Triangles[] = []
  worldMatrix: Matrix = Matrix.withIdentity()
  texture?: Texture

  addTriangles(triangles: Triangles, clone = true) {
    this.trianglesList.push(clone ? triangles.clone() : triangles)
  }
}
