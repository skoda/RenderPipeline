import { clamp } from '../../src/math'

test('clamp within range', () => {
  const result = clamp(5, 10, 0)
  expect(result).toBe(5)
})

test('clamp below range', () => {
  const result = clamp(-5, 10, 0)
  expect(result).toBe(0) // Should be clamped to the minimum value (0)
})

test('clamp above range', () => {
  const result = clamp(15, 10, 0)
  expect(result).toBe(10) // Should be clamped to the maximum value (10)
})
