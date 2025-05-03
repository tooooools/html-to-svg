import * as Transform from 'transformation-matrix'

export default function (value) {
  if (!value || value === 'none' || value === '') return null

  const matrix = Transform.fromString(value)
  const { translate, scale, rotation } = Transform.decomposeTSR(matrix)

  return {
    raw: value,
    translate,
    scale,
    rotation,
    toSVGTransform: ({ x = 0, y = 0, origin = [0, 0] } = {}) => {
      const cx = x + origin[0]
      const cy = y + origin[1]

      return Transform.toString(
        Transform.compose(
          Transform.translate(translate?.tx ?? 0, translate?.ty ?? 0),
          Transform.scale(scale?.sx ?? 1, scale?.sy ?? scale?.sx ?? 1, cx, cy),
          Transform.rotate(rotation?.angle ?? 0, cx, cy)
        )
      )
    }
  }
}
