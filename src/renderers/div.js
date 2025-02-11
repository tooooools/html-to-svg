import $ from '../utils/dom-render-svg'
import { parse as parseGradient } from 'gradient-parser'

const kebabToCamel = s => s.replace(/-./g, x => x[1].toUpperCase())

function isTransparent (color) {
  if (!color || color === 'none' || color === 'transparent') return true

  if (color.startsWith('rgba')) {
    const rgba = color.match(/[\d.]+/g)
    if (rgba[3] === '0') return true
  }

  return false
}

export default ({
  debug,
  fonts
}) => async (element, { x, y, width, height, style }) => {
  if (!width || !height) return

  const backgroundColor = style.getPropertyValue('background-color')
  const backgroundImage = style.getPropertyValue('background-image') ?? 'none'

  // Skip visually empty blocks
  if (isTransparent(backgroundColor) && isTransparent(backgroundImage)) return

  const borderColor = style.getPropertyValue('border-color')
  const borderStyle = style.getPropertyValue('border-style')

  const props = {
    x,
    y,
    width,
    height,
    ...((() => {
      // TODO SVG stroke is drawn on center, CSS stroke is drawn on outside
      // TODO border-top|bottom|left|right
      // TODO stroke-style
      if (borderStyle === 'none') return
      if (isTransparent(borderColor)) return

      return {
        stroke: borderColor ?? 'none',
        'stroke-width': style.getPropertyValue('border-width')
      }
    })() ?? {}),
    fill: backgroundColor,
    rx: parseInt(style.getPropertyValue('border-radius')) || null
  }

  return isTransparent(backgroundImage)
    ? $('rect', props)
    // Render <rect> with background image
    : (() => {
        const defs = $('defs')
        const id = `gradient_${Date.now()}-${(Math.random() * 46656) | 0}`

        // TODO handle multiple gradients
        const { colorStops, orientation, type } = parseGradient(backgroundImage)?.[0] ?? {}

        // TODO handle repeating gradients type, SEE https://github.com/rafaelcaricio/gradient-parser?tab=readme-ov-file#ast
        const gradient = $(kebabToCamel(type), {
          id,
          gradientUnits: 'objectBoundingBox', // Allow specifying rotation center in %
          gradientTransform: orientation
            ? (() => {
                switch (orientation.type) {
                  case 'angular': return `rotate(${270 + parseFloat(orientation.value)}, 0.5, 0.5)`
                  case 'directional': {
                    switch (orientation.value) {
                      case 'top': return 'rotate(270, 0.5, 0.5)'
                      case 'right': return null
                      case 'bottom': return 'rotate(90, 0.5, 0.5)'
                      case 'left': return 'rotate(180, 0.5, 0.5)'
                    }
                  }
                }
              })()
            : 'rotate(90, 0.5, 0.5)'
        }, defs)

        colorStops.forEach((colorStop, index) => (
          $('stop', {
            offset: colorStop.length
              // TODO handle colorStop.length.type other than '%'
              ? +colorStop.length.value / 100
              : index / (colorStops.length - 1),
            'stop-color': `${colorStop.type}(${colorStop.value})`
          }, gradient)
        ))

        return $('g', {}, null, [
          defs,
          $('rect', { ...props, fill: `url(#${id})` })
        ])
      })()
}
