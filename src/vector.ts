import { KeyOfType } from "./utility"

abstract class Vector {
  get vals(): number[] {
    throw new Error("Can't instantiate abstract Vector base class.")
  }

  private perform(method: (k:KeyOfType<this,number>) => void) {
    for(const k in this.keys)
      method(k as KeyOfType<this,number>)
    return this
  }

  scale(s: number) {
    return this.perform((k: KeyOfType<this,number>) => (this[k]) *= s)
  }

  negate() {
    return this.scale(-1)
  }
}

export class Vector2 extends Vector {
  x = 0
  y = 0

  get vals() {
    return [this.x,this.y]
  }
    
  private constructor() {
    super()
  }



  static withXY(x: number, y: number) {
    return new Vector2(x, y)
  }
}
