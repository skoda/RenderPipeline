import { Vector2, Vector3, clamp } from '../lib/render-pipeline/index.js'
import { CANVAS_ID, FLOOR_RADIUS } from './consts.js'

const KeyMap = {
  W: 'KeyW',
  A: 'KeyA',
  S: 'KeyS',
  D: 'KeyD',
  Left: 'ArrowLeft',
  Up: 'ArrowUp',
  Right: 'ArrowRight',
  Down: 'ArrowDown',
  Touch: 'Touch',
  TiltRight: 'TiltRight',
  TiltLeft: 'TiltLeft',
  TiltUp: 'TiltUp',
  TiltDown: 'TiltDown'
}

let cam
const keysDown = new Set()
const FLOOR_RADIUS_SQ = FLOOR_RADIUS * FLOOR_RADIUS

export const Controls = {
  init: async (camera) => {
    cam = camera

    // Setup keyed movement WASD to move and ↑↓←→ to look
    window.addEventListener('keydown', (e) => keysDown.add(e.code))
    window.addEventListener('keyup', (e) => keysDown.delete(e.code))

    // Setup looking with mouse movement
    const canvas = document.getElementById(CANVAS_ID)
    canvas.addEventListener('click', async () => {
      await canvas.requestPointerLock({ unadjustedMovement: true })
    })
    document.addEventListener('pointerlockchange', () => {
      const addOrRemove =
        document.pointerLockElement === canvas ? 'addEventListener' : 'removeEventListener'
      document[addOrRemove]('mousemove', Controls.mouseMovement, false)
    })

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      if (e.touches.length > 0) keysDown.add(KeyMap.Touch)
    })
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      if (e.touches.length === 0) keysDown.delete(KeyMap.Touch)
    })

    // Setup looking with devicemotion
    const motionButton = document.getElementById('motionButton')
    const initializeMotion = async () => {
      const response = await DeviceMotionEvent.requestPermission()
      if (response === 'granted') {
        addEventListener('devicemotion', (event) => {
          const { x } = event.accelerationIncludingGravity
          const { alpha } = event.rotationRate

          const turn = ((clamp(Math.abs(x), 6, 0.5) - 0.5) * event.interval) / 3
          if (x < -0.5) cam.turnLeft(turn)
          else if (x > 0.5) cam.turnRight(turn)

          const tilt = ((clamp(Math.abs(alpha), 30, 1) - 1) * event.interval) / 25
          if (alpha > 1) cam.pitchUp(tilt)
          else if (alpha < -1) cam.pitchDown(tilt)
        })
        motionButton.removeEventListener('click', motionButton)
        motionButton.style.visibility = 'hidden'
      }
    }
    motionButton.addEventListener('click', initializeMotion)
  },

  mouseMovement: (e) => {
    cam.pitchDown(e.movementY / 500)
    cam.turnRight(e.movementX / 800)
  },

  inputTest: (perSecond, noFlying = true) => {
    const movementLock = new Vector3(1, noFlying ? 0 : 1, 1)

    if (keysDown.has(KeyMap.W) || keysDown.has(KeyMap.Touch))
      cam.moveForward(5 * perSecond, movementLock)
    else if (keysDown.has(KeyMap.S)) cam.moveBackward(5 * perSecond, movementLock)

    if (keysDown.has(KeyMap.A)) cam.moveLeft(5 * perSecond, movementLock)
    else if (keysDown.has(KeyMap.D)) cam.moveRight(5 * perSecond, movementLock)

    if (keysDown.has(KeyMap.Up)) cam.pitchUp(1 * perSecond)
    else if (keysDown.has(KeyMap.Down)) cam.pitchDown(1 * perSecond)

    if (keysDown.has(KeyMap.Left) || keysDown.has(KeyMap.TiltLeft)) cam.turnLeft(1 * perSecond)
    else if (keysDown.has(KeyMap.Right) || keysDown.has(KeyMap.TiltRight))
      cam.turnRight(1 * perSecond)

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
