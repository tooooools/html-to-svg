import $ from './dom-render-svg'

const round = value => Math.round(value * 1000) / 1000

function cssLength (value, fontSize, fallback) {
  if (!value || value === 'auto' || value === 'from-font') return fallback

  const number = parseFloat(value)
  if (isNaN(number)) return fallback
  if (value.endsWith('%')) return fontSize * number / 100
  return number
}

function strokeProps (style, thickness) {
  switch (style) {
    case 'dotted': return {
      'stroke-dasharray': `0 ${round(thickness * 2)}`,
      'stroke-linecap': 'round'
    }
    case 'dashed': return {
      'stroke-dasharray': `${round(thickness * 3)} ${round(thickness * 2)}`
    }
    default: return {}
  }
}

function renderWave (g, { x, y, width, thickness, color, fontSize }) {
  const amplitude = Math.max(thickness, fontSize / 16)
  const halfWave = amplitude * 2
  let cursor = x
  let direction = -1
  let path = `M ${round(x)} ${round(y)}`

  while (cursor < x + width) {
    const end = Math.min(cursor + halfWave, x + width)
    path += ` Q ${round((cursor + end) / 2)} ${round(y + direction * amplitude)} ${round(end)} ${round(y)}`
    cursor = end
    direction *= -1
  }

  $('path', {
    d: path,
    fill: 'none',
    stroke: color,
    'stroke-width': thickness,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  }, g)
}

function renderLine (g, {
  x,
  y,
  width,
  thickness,
  color,
  style,
  fontSize,
  line
}) {
  if (style === 'wavy') {
    renderWave(g, { x, y, width, thickness, color, fontSize })
    return
  }

  const positions = style === 'double'
    ? line === 'underline'
      ? [y, y + thickness * 2]
      : line === 'overline'
        ? [y, y - thickness * 2]
        : [y - thickness, y + thickness]
    : [y]

  for (const position of positions) {
    $('line', {
      x1: x,
      x2: x + width,
      y1: position,
      y2: position,
      stroke: color,
      'stroke-width': thickness,
      ...strokeProps(style, thickness)
    }, g)
  }
}

export default function ({
  x,
  width,
  baseline,
  fontSize,
  font,
  color,
  decorations
}) {
  if (!width || !decorations?.length) return

  const { unitsPerEm, tables } = font
  const post = tables.post ?? {}
  const os2 = tables.os2 ?? {}
  const ascender = tables.hhea?.ascender ?? font.ascender
  const fontThickness = Math.max(
    0.5,
    Math.abs(post.underlineThickness ?? unitsPerEm / 16) / unitsPerEm * fontSize
  )
  const underline = baseline -
    (post.underlinePosition ?? -unitsPerEm / 10) / unitsPerEm * fontSize
  const overline = baseline - ascender / unitsPerEm * fontSize + fontThickness / 2
  const strikeThrough = baseline -
    (os2.yStrikeoutPosition ?? unitsPerEm * 0.3) / unitsPerEm * fontSize
  const g = $('g', { class: 'text-decoration' })

  for (const decoration of decorations) {
    const thickness = Math.max(
      0.5,
      cssLength(decoration.thickness, fontSize, fontThickness)
    )
    const decorationColor = (
      !decoration.color ||
      decoration.color === 'currentcolor'
    )
      ? color
      : decoration.color
    const decorationStyle = decoration.style || 'solid'
    const underlineOffset = cssLength(decoration.underlineOffset, fontSize, 0)

    for (const line of decoration.lines) {
      const y = line === 'underline'
        ? underline + underlineOffset
        : line === 'overline'
          ? overline
          : line === 'line-through'
            ? strikeThrough
            : null

      if (y === null) continue
      renderLine(g, {
        x,
        y,
        width,
        thickness,
        color: decorationColor,
        style: decorationStyle,
        fontSize,
        line
      })
    }
  }

  return g.children.length ? g : undefined
}
