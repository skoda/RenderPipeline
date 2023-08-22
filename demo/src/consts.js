import { Color, Light, Vector3 } from '../lib/render-pipeline/index.js'

export const CANVAS_ID = 'screenbuffer'
export const FRAMERATE_ID = 'framerateView'
export const UP_VEC = new Vector3(0, 1, 0)
export const DOWN_VEC = new Vector3(0, -1, 0)
export const FLOOR_RADIUS = 20
export const EYE_HEIGHT = 2.25
export const NEAR_PLANE = 0.25
export const FAR_PLANE = 75
export const ABMIENT_LIGHT_DEFAULT = new Color(0.3, 0.2, 0.1)
export const DIFFUSE_LIGHT_DEFAULT = new Color(1, 0.9, 0.8)
export const SPECULAR_LIGHT_DEFAULT = new Color(0.9, 0.8, 0.6)
export const SUN_POSITION = new Vector3(0, 3.25, 0)

// Amped up sun point light for the celestial objects to make
// sharper contrast between the sun facing, and dark sides
// Color values beyond 1.0 get clamped, but lighting calculations
// are performed first. More of the object will be fully lit.
export const SUN_LIGHT = Light.withOptions({
  pos: SUN_POSITION,
  ambt: new Color(0.15, 0.15, 0.1),
  diff: new Color(3, 3, 3),
  spec: SPECULAR_LIGHT_DEFAULT
})
