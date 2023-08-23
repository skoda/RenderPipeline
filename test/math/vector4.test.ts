import { Vector4, Vector3 } from "../../src/math"

test('Vector4 constructors', () => {
  const vec4 = new Vector4(4, 2, 0, -1)
  expect(Object.values(vec4)).toStrictEqual([4, 2, 0, -1])
})

test('Vector4 x,y,z,w member assignment', () => {
  const vec4 = new Vector4(0, 0, 0, 0)
  vec4.x = 5
  vec4.y = 8
  vec4.z = 2
  vec4.w = -1
  expect(Object.values(vec4)).toStrictEqual([5, 8, 2, -1])
})

test('Vector4 clone', () => {
  const v1 = new Vector4(1, 2, 3, 4)
  const v2 = v1.clone()
  expect(v1).not.toBe(v2)
  expect(v1).toStrictEqual(v2)
  v2.x = 1000
  expect(v1).not.toStrictEqual(v2)
})

test('Vector4 arithmetic', () => {
  const v1 = new Vector4(1, 2, 3, 4)
  const v2 = new Vector4(8, 7, 6, 5)
  expect(Object.values(v1.clone().add(v2))).toStrictEqual([9, 9, 9, 9])
  expect(Object.values(v2.clone().subtract(v1))).toStrictEqual([7, 5, 3, 1])
  v1.multiply(v2)
  expect(Object.values(v1)).toStrictEqual([8, 14, 18, 20])
})

test('Vector4 dot product', () => {
  const v1 = new Vector4(5, 0, 0, 1)
  const v2 = new Vector4(0, 3, 0, 2)
  const v3 = new Vector4(3, 0, 0, -1)
  expect(v1.dot(v2)).toBe(2)
  expect(v1.dot(v3)).toBe(14)
})

test('Vector4 scaling', () => {
  const vector = new Vector4(2, 3, 4, 5)
  const scaledVector = vector.clone().scale(2)
  expect(Object.values(scaledVector)).toStrictEqual([4, 6, 8, 10])
})

test('Vector4 negation', () => {
  const vector = new Vector4(2, -3, 4, -5)
  const negatedVector = vector.clone().negate()
  expect(Object.values(negatedVector)).toStrictEqual([-2, 3, -4, 5])
})

test('Vector4 normalization', () => {
  const vector = new Vector4(3, 4, 0, 5)
  const normalizedVector = vector.clone().normalize()
  const expectedMagnitude = Math.sqrt(3 * 3 + 4 * 4 + 5 * 5)
  const expectedValues = [
    3 / expectedMagnitude,
    4 / expectedMagnitude,
    0 / expectedMagnitude,
    5 / expectedMagnitude
  ]
  expect(Object.values(normalizedVector)).toStrictEqual(expectedValues)
})

test('Vector4 clamp', () => {
  const vector = new Vector4(5, -3, 10, -8)
  const clampedVector = vector.clone().clamp(5, 0)
  expect(Object.values(clampedVector)).toStrictEqual([5, 0, 5, 0])
})

test('Vector4 magnitude and magnitudeSquared', () => {
  const vector = new Vector4(3, 4, 0, 5)
  expect(vector.magnitudeSquared).toBe(50)
  expect(vector.magnitude).toBe(Math.sqrt(50))
})

test('Vector4 withPosition and withDirection', () => {
  const position = new Vector3(1, 2, 3)
  const direction = new Vector3(0, 1, 0)
  const positionVector = Vector4.withPosition(position)
  const directionVector = Vector4.withDirection(direction)
  expect(Object.values(positionVector)).toStrictEqual([1, 2, 3, 1])
  expect(Object.values(directionVector)).toStrictEqual([0, 1, 0, 0])
})
