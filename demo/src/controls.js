import { Vector2, Vector3 } from '../lib/render-pipeline/index.js'
import { FLOOR_RADIUS } from './consts.js'

const KeyMap = {
  W: 'KeyW',
  A: 'KeyA',
  S: 'KeyS',
  D: 'KeyD',
  Left: 'ArrowLeft',
  Up: 'ArrowUp',
  Right: 'ArrowRight',
  Down: 'ArrowDown'
}

let cam
const keysDown = new Set()
const FLOOR_RADIUS_SQ = FLOOR_RADIUS * FLOOR_RADIUS

export const Controls = {
  init: (camera) => {
    cam = camera

    window.addEventListener('keydown', (e) => keysDown.add(e.code))
    window.addEventListener('keyup', (e) => keysDown.delete(e.code))
  },

  inputTest: (perSecond, noFlying = true) => {
    const movementLock = new Vector3(1, noFlying ? 0 : 1, 1)

    if (keysDown.has(KeyMap.W)) cam.moveForward(5 * perSecond, movementLock)
    else if (keysDown.has(KeyMap.S)) cam.moveBackward(5 * perSecond, movementLock)

    if (keysDown.has(KeyMap.A)) cam.moveLeft(5 * perSecond, movementLock)
    else if (keysDown.has(KeyMap.D)) cam.moveRight(5 * perSecond, movementLock)

    if (keysDown.has(KeyMap.Up)) cam.pitchUp(1 * perSecond)
    else if (keysDown.has(KeyMap.Down)) cam.pitchDown(1 * perSecond)

    if (keysDown.has(KeyMap.Left)) cam.turnLeft(1 * perSecond)
    else if (keysDown.has(KeyMap.Right)) cam.turnRight(1 * perSecond)

    collisionCheck(cam)
  }
}

const collisionCheck = (camera) => {
  // Very much hardcoded to the demo scenario
  // Check camera collision in the 2d plane where y === 0
  const cp = new Vector2(camera.position.x, camera.position.z)
  const sqDistToOrigin = cp.magnitudeSquared

  if (sqDistToOrigin < 4)
    // Test central pillar
    cp.normalize().scale(2)
  else if (sqDistToOrigin > FLOOR_RADIUS_SQ)
    // Test edge of floor
    cp.normalize().scale(FLOOR_RADIUS)

  camera.position.x = cp.x
  camera.position.z = cp.y
}
