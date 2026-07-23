import * as Transform from 'transformation-matrix'

const MATRIX_EPSILON = 1e-10
const isZero = value => Math.abs(value) < MATRIX_EPSILON
const isOne = value => Math.abs(value - 1) < MATRIX_EPSILON

function as2DMatrix (value) {
  if (!value.startsWith('matrix3d(')) return value

  const values = value
    .slice('matrix3d('.length, -1)
    .split(',')
    .map(Number)

  if (
    values.length !== 16 ||
    values.some(number => !Number.isFinite(number))
  ) throw new Error(`Invalid CSS transform: ${value}`)

  const compatible = (
    isZero(values[2]) &&
    isZero(values[3]) &&
    isZero(values[6]) &&
    isZero(values[7]) &&
    isZero(values[8]) &&
    isZero(values[9]) &&
    isOne(values[10]) &&
    isZero(values[11]) &&
    isZero(values[14]) &&
    isOne(values[15])
  )

  if (!compatible) {
    throw new Error(`Unsupported 3D CSS transform: ${value}`)
  }

  return `matrix(${[
    values[0],
    values[1],
    values[4],
    values[5],
    values[12],
    values[13]
  ].join(',')})`
}

export default function (value) {
  if (!value || value === 'none' || value === '') return null

  const matrix = Transform.fromString(as2DMatrix(value))
  const { translate, scale, rotation } = Transform.decomposeTSR(matrix)

  return {
    raw: value,
    matrix,
    translate,
    scale,
    rotation,
    toSVGTransform: ({ x = 0, y = 0, origin = [0, 0] } = {}) => {
      const cx = x + origin[0]
      const cy = y + origin[1]

      return Transform.toString(
        Transform.compose(
          Transform.translate(cx, cy),
          matrix,
          Transform.translate(-cx, -cy)
        )
      )
    }
  }
}
