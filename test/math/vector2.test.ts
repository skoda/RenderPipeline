import { Vector2 } from '../../src/math'

test('Vector2 constructors', () => {
  const vec2 = new Vector2(4, 2)
  const origin = new Vector2(0, 0)
  expect(Object.values(vec2)).toStrictEqual([4, 2])
  expect(Object.values(origin)).toStrictEqual([0, 0])
})

test('Vector2 x,y member assignment', () => {
  const vec2 = new Vector2(0, 0)
  vec2.x = 5
  vec2.y = 8
  expect(Object.values(vec2)).toStrictEqual([5, 8])
})

test('Vector2 clone', () => {
  const v1 = new Vector2(1, 2)
  const v2 = v1.clone()
  expect(v1).not.toBe(v2)
  expect(v1).toStrictEqual(v2)
  v2.x = 1000
  expect(v1).not.toStrictEqual(v2)
})

test('Vector2 arithmetic', () => {
  const v1 = new Vector2(1, 2)
  const v2 = new Vector2(3, 4)
  expect(Object.values(v1.clone().add(v2))).toStrictEqual([4, 6])
  expect(Object.values(v2.clone().subtract(v1))).toStrictEqual([2, 2])
  v1.multiply(v2)
  expect(Object.values(v1)).toStrictEqual([3, 8])
})

test('Vector2 dot product', () => {
  const v1 = new Vector2(5, 0)
  const v2 = new Vector2(0, 3)
  const v3 = new Vector2(3, 0)
  expect(v1.dot(v2)).toBe(0)
  expect(v1.dot(v3)).toBe(15)
})

test('Vector2 scaling', () => {
  const vector = new Vector2(2, 3)
  const scaledVector = vector.clone().scale(2)
  expect(Object.values(scaledVector)).toStrictEqual([4, 6])
})

test('Vector2 negation', () => {
  const vector = new Vector2(2, -3)
  const negatedVector = vector.clone().negate()
  expect(Object.values(negatedVector)).toStrictEqual([-2, 3])
})

test('Vector2 clamp', () => {
  const vector = new Vector2(5, -3)
  const clampedVector = vector.clone().clamp(5, 0)
  expect(Object.values(clampedVector)).toStrictEqual([5, 0])
})

test('Vector2 magnitude and magnitudeSquared', () => {
  const vector = new Vector2(3, 4)
  expect(vector.magnitudeSquared).toBe(25)
  expect(vector.magnitude).toBe(5)
})

test('Vector2 normalization', () => {
  const vector = new Vector2(3, 4)
  const normalizedVector = vector.clone().normalize()
  expect(normalizedVector.magnitude).toStrictEqual(1)
})
