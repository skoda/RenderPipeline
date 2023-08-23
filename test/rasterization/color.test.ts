import { Color } from '../../src/rasterization'


test('Color constructors', () => {
  const color = new Color(0.5, 0.25, 1)
  expect(Object.values(color)).toStrictEqual([0.5, 0.25, 1])
})

test('Color r,g,b member assignment', () => {
  const color = new Color(0, 0, 0)
  color.r = 0.5
  color.g = 0.75
  color.b = 1
  expect(Object.values(color)).toStrictEqual([0.5, 0.75, 1])
})

test('Color clone', () => {
  const c1 = new Color(0.1, 0.2, 0.3)
  const c2 = c1.clone()
  expect(c1).not.toBe(c2)
  expect(c1).toStrictEqual(c2)
  c2.r = 0.5
  expect(c1).not.toStrictEqual(c2)
})

test('Color scaling', () => {
  const color = new Color(0.2, 0.4, 0.6)
  const scaledColor = color.clone().scale(2)
  expect(Object.values(scaledColor)).toStrictEqual([0.4, 0.8, 1.2])
})

test('Color negation', () => {
  const color = new Color(0.1, -0.2, 0.3)
  const negatedColor = color.clone().negate()
  expect(Object.values(negatedColor)).toStrictEqual([-0.1, 0.2, -0.3])
})

// test('Color arithmetic', () => {
//   const c1 = new Color(1, 0.7, 0.75)
//   const c2 = new Color(0.5, 0.3, 0.5)
//   expect(Object.values(c1.clone().add(c2))).toStrictEqual([1.5, 1, 1.25])
//   expect(Object.values(c2.clone().subtract(c1))).toStrictEqual([-0.5, -0.4, -0.25])
//   c1.multiply(c2)
//   expect(Object.values(c1)).toBeCloseToArray([0.5, 0.21, 0.375])
// })

test('Color clamp', () => {
  const color = new Color(1.5, -0.2, 0.8)
  const clampedColor = color.clone().clamp(1, 0)
  expect(Object.values(clampedColor)).toStrictEqual([1, 0, 0.8])
})

test('Color static methods', () => {
  const valueColor = Color.withValue(0.5)
  const whiteColor = Color.withWhite()
  const blackColor = Color.withBlack()
  expect(Object.values(valueColor)).toStrictEqual([0.5, 0.5, 0.5])
  expect(Object.values(whiteColor)).toStrictEqual([1, 1, 1])
  expect(Object.values(blackColor)).toStrictEqual([0, 0, 0])
})
