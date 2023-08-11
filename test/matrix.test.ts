import { Matrix, Vector4 } from '../src/math'

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
