export default function clamp(num: number, max: number, min = 0) {
  return Math.min(Math.max(num, min), max)
}
