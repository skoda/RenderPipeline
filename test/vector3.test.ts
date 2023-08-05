import Vector3 from '../src/vector3'

test('Vector3 constructors', () => {
  const vec3 = Vector3.withXYZ(4, 2, 0)
  const origin = Vector3.withOrigin()
  expect(vec3).toStrictEqual([4, 2, 0])
  expect(origin).toStrictEqual([0, 0, 0])
})

test('Vector3 x,y,z getters/setters', () => {
  const vec3 = Vector3.withOrigin()
  vec3.x = 5
  vec3.y = 8
  vec3.z = 1
  expect(vec3).toStrictEqual([5, 8, 1])
})

test('Vector3 clone', () => {
  const v1 = Vector3.withXYZ(1, 2, 3)
  const v2 = v1.clone()
  expect(v1).not.toBe(v2)
  expect(v1).toStrictEqual(v2)
  v2.x = 1000
  expect(v1).not.toStrictEqual(v2)
})

test('Vector3 arithmetic', () => {
  const v1 = Vector3.withXYZ(1, 2, 3)
  const v2 = Vector3.withXYZ(8, 7, 6)
  expect(v1.clone().add(v2)).toStrictEqual([9, 9, 9])
  expect(v2.clone().subtract(v1)).toStrictEqual([7, 5, 3])
  v1.multiply(v2)
  expect(v1).toStrictEqual([8, 14, 18])
})
