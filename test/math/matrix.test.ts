import { Matrix, Vector3, Vector4 } from '../../src/math'

test('Matrix multiplication', () => {
  const m1 = new Matrix(
    new Vector4(1, 1, 1, 1),
    new Vector4(2, 2, 2, 2),
    new Vector4(3, 3, 3, 3),
    new Vector4(4, 4, 4, 4)
  )
  const m2 = new Matrix(
    new Vector4(2, 1, 3, 1),
    new Vector4(2, 1, 3, 1),
    new Vector4(2, 1, 3, 1),
    new Vector4(2, 1, 3, 1)
  )
  const m3 = Matrix.multiply(m1, m2)
  const r0 = [8, 4, 12, 4]
  const r1 = [16, 8, 24, 8]
  const r2 = [24, 12, 36, 12]
  const r3 = [32, 16, 48, 16]

  expect(Object.values(m3.r0)).toStrictEqual(r0)
  expect(Object.values(m3.r1)).toStrictEqual(r1)
  expect(Object.values(m3.r2)).toStrictEqual(r2)
  expect(Object.values(m3.r3)).toStrictEqual(r3)

  m1.multiplyMatrix(m2)
  expect(m1).toStrictEqual(m3)
})

test('Matrix cloning', () => {
  const m1 = new Matrix(
    new Vector4(1, 2, 3, 4),
    new Vector4(5, 6, 7, 8),
    new Vector4(9, 10, 11, 12),
    new Vector4(13, 14, 15, 16)
  )

  const m2 = m1.clone()
  expect(m2).toEqual(m1)
  expect(m2).not.toBe(m1) // Cloned matrix should be a different object
})

test('Matrix identity creation', () => {
  const identity = Matrix.withIdentity()

  const expectedResult = new Matrix(
    new Vector4(1, 0, 0, 0),
    new Vector4(0, 1, 0, 0),
    new Vector4(0, 0, 1, 0),
    new Vector4(0, 0, 0, 1)
  )

  expect(identity).toEqual(expectedResult)
})

test('Matrix scaling', () => {
  const scaleVector = new Vector3(2, 3, 4)
  const scaledMatrix = Matrix.scaleWithVector(scaleVector)

  const expectedResult = new Matrix(
    new Vector4(2, 0, 0, 0),
    new Vector4(0, 3, 0, 0),
    new Vector4(0, 0, 4, 0),
    new Vector4(0, 0, 0, 1)
  )

  expect(scaledMatrix).toEqual(expectedResult)
})

test('Matrix translation', () => {
  const translationVector = new Vector3(1, 2, 3)
  const translatedMatrix = Matrix.translationWithVector(translationVector)

  const expectedResult = new Matrix(
    new Vector4(1, 0, 0, 1),
    new Vector4(0, 1, 0, 2),
    new Vector4(0, 0, 1, 3),
    new Vector4(0, 0, 0, 1)
  )

  expect(translatedMatrix).toEqual(expectedResult)
})
