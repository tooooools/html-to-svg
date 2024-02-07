import $ from '../utils/dom-render-svg'

function isTransparent (color) {
  if (!color || color === 'none' || color === 'transparent') return true

  if (color.startsWith('rgba')) {
    const rgba = color.match(/[\d.]+/g)
    if (rgba[3] === '0') return false
  }

  return false
}

export default ({
  debug,
  fonts
}) => async (element, { x, y, width, height, style }) => {
  if (!width || !height) return

  // TODO background-image
  const backgroundColor = style.getPropertyValue('background-color')

  // Skip visually empty blocks
  if (isTransparent(backgroundColor)) return

  // TODO SVG stroke is drawn on center, CSS stroke is drawn on outside
  // TODO border-top|bottom|left|right
  // TODO stroke-style
  const stroke = {
    stroke: 'none',
    'stroke-width': 1
  }
  const borderColor = style.getPropertyValue('border-color')
  const borderStyle = style.getPropertyValue('border-style')
  if (borderStyle !== 'none' && !isTransparent(borderColor)) {
    stroke.stroke = borderColor
    stroke['stroke-width'] = style.getPropertyValue('border-width')
  }

  return $('rect', {
    x,
    y,
    width,
    height,
    ...stroke,
    fill: backgroundColor,
    rx: parseInt(style.getPropertyValue('border-radius')) || null
  })
}
