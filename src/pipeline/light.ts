import { Vector3 } from '../math/index.js'
import { Color } from '../rasterization/index.js'

// Light in the 3d scene
// If it doesn't have position or direction, only ambient and emissive terms
// are used to light models with no unique per vertex luminosity calculations
export class Light {
  #position?: Vector3
  #direction?: Vector3
  diffuse?: Color
  specular?: Color
  ambient?: Color
  emissive?: Color

  static withOptions({
    pos,
    dir,
    diff,
    spec,
    ambt,
    emsv
  }: {
    pos?: Vector3
    dir?: Vector3
    diff?: Color
    spec?: Color
    ambt?: Color
    emsv?: Color
  }) {
    const out = new Light()
    out.setDirection(dir)
    out.setPosition(pos)
    out.diffuse = diff
    out.specular = spec
    out.ambient = ambt
    out.emissive = emsv
    return out
  }

  get illuminatesVertices() {
    return (this.#position || this.#direction) && (this.diffuse || this.specular)
  }

  setPosition(position?: Vector3) {
    this.#position = position?.clone()
    position && (this.#direction = undefined)
  }

  get position() {
    return this.#position
  }

  setDirection(direction?: Vector3) {
    this.#direction = direction?.clone().normalize()
    direction && (this.#position = undefined)
  }

  get direction() {
    return this.#direction
  }

  clone() {
    const out = new Light()
    out.#position = this.#position?.clone()
    out.#direction = this.#direction?.clone()
    out.diffuse = this.diffuse
    out.specular = this.specular
    out.ambient = this.ambient
    out.emissive = this.emissive
    return out
  }
}
