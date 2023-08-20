import { Matrix, Vector3, Vector4, clamp } from '../math'

export class Camera {
  ahead: Vector3
  up: Vector3

  position: Vector3
  heading = new Vector3(0, 0, 0)

  maxPitch = 0.45 * Math.PI
  pitch = 0
  yaw = 0

  constructor(ahead: Vector3, up: Vector3, position: Vector3, maxPitch?: number) {
    this.ahead = ahead.clone().normalize()
    this.up = up.clone().normalize()
    this.position = position.clone()
    maxPitch && (this.maxPitch = maxPitch)
    this.setHeading()
  }

  viewMatrix() {
    return Matrix.rotationWithLookDirection(this.heading, this.up).multiplyMatrix(
      Matrix.translationWithVector(this.position.clone().negate())
    )
  }
  setHeading() {
    this.heading = Matrix.rotationAroundAxis(this.up, this.yaw)
      .multiplyMatrix(Matrix.rotationAroundAxis(Vector3.cross(this.up, this.ahead), this.pitch))
      .multiplyVector(Vector4.withDirection(this.ahead))
  }

  moveForward(distance: number, axisLock?: Vector3) {
    const move = this.heading.clone()
    axisLock && move.multiply(axisLock).normalize()
    this.position.add(move.scale(distance))
  }
  moveBackward(distance: number, axisLock?: Vector3) {
    this.moveForward(-distance, axisLock)
  }
  moveRight(distance: number, axisLock?: Vector3) {
    const move = Vector3.cross(this.up, this.heading)
    axisLock && move.multiply(axisLock)
    this.position.add(move.normalize().scale(distance))
  }
  moveLeft(distance: number, axisLock?: Vector3) {
    this.moveRight(-distance, axisLock)
  }

  turnRight(angle: number) {
    this.yaw = (this.yaw + angle) % (2 * Math.PI)
    this.setHeading()
  }
  turnLeft(angle: number) {
    this.turnRight(-angle)
  }
  pitchDown(angle: number) {
    this.pitch = clamp(this.pitch + angle, this.maxPitch, -this.maxPitch)
    this.setHeading()
  }
  pitchUp(angle: number) {
    this.pitchDown(-angle)
  }
}
