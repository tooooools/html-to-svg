import $ from '../utils/dom-render-svg'
import { parse as parseGradient } from 'gradient-parser'
import { uid } from 'uid'

const kebabToCamel = s => s.replace(/-./g, x => x[1].toUpperCase())

function isTransparent (color) {
  if (!color || color === 'none' || color === 'transparent') return true

  if (color.startsWith('rgba')) {
    const rgba = color.match(/[\d.]+/g)
    if (rgba[3] === '0') return true
  }

  return false
}

function parseBorders (s) {
  let borders = null

  for (const dir of ['top', 'right', 'bottom', 'left']) {
    const color = s.getPropertyValue(`border-${dir}-color`)
    const width = parseInt(s.getPropertyValue(`border-${dir}-width`))
    const style = s.getPropertyValue(`border-${dir}-style`)

    // Skip invisible
    if (isTransparent(color)) continue
    if (!width || isNaN(width)) continue
    if (style === 'none' || style === 'hidden') continue

    borders ??= {}
    borders[dir] = { color, width, style }
  }

  return borders
}

export default ({
  debug,
  fonts
}) => async (element, { x, y, width, height, style, defs }) => {
  if (!width || !height) return

  const backgroundColor = style.getPropertyValue('background-color')
  const backgroundImage = style.getPropertyValue('background-image') ?? 'none'
  const boxShadow = style.getPropertyValue('box-shadow') ?? 'none'
  const borderRadius = parseInt(style.getPropertyValue('border-radius')) ?? null
  const borders = parseBorders(style)

  // Skip visually empty blocks
  if (isTransparent(backgroundColor) && isTransparent(backgroundImage) && !borders) return

  // Render initial rect
  const g = $('g')
  const rect = $('rect', {
    x,
    y,
    width,
    height,
    fill: backgroundColor,
    rx: borderRadius
  }, g)

  // Render background-image
  if (!isTransparent(backgroundImage)) {
    // TODO handle multiple gradients
    const {
      colorStops,
      orientation,
      type
    } = parseGradient(backgroundImage)?.[0] ?? {}

    // TODO handle repeating gradients type, SEE https://github.com/rafaelcaricio/gradient-parser?tab=readme-ov-file#ast
    const gradient = $(kebabToCamel(type), {
      id: 'gradient_' + uid(),
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

    // Add color stops
    for (let index = 0; index < colorStops.length; index++) {
      const colorStop = colorStops[index]
      const stop = $('stop', {
        offset: colorStop.length
          // TODO handle colorStop.length.type other than '%'
          ? +colorStop.length.value / 100
          : index / (colorStops.length - 1),
        'stop-color': `${colorStop.type}(${colorStop.value})`
      })

      gradient.appendChild(stop)
    }

    rect.setAttribute('fill', `url(#${gradient.id})`)
  }

  // Render box shadow
  if (boxShadow !== 'none') {
    const filter = $('filter', { id: 'filter_' + uid() }, defs)
    // This assumes browser consistency of the CSSStyleDeclaration.getPropertyValue returned string
    const REGEX_SHADOW_DECLARATION = /rgba?\(([\d.]{1,3}(,\s)?){3,4}\)\s(-?(\d+)px\s?){4}/g
    const REGEX_SHADOW_DECLARATION_PARSER = /(rgba?\((?:[\d.]{1,3}(?:,\s)?){3,4}\))\s(-?[\d.]+)px\s(-?[\d.]+)px\s(-?[\d.]+)px\s(-?[\d.]+)px/

    for (const shadowString of boxShadow.match(REGEX_SHADOW_DECLARATION) ?? []) {
      let [
        ,
        color,
        offx,
        offy,
        blur,
        spread
      ] = shadowString.match(REGEX_SHADOW_DECLARATION_PARSER)

      offx = parseInt(offx)
      offy = parseInt(offy)
      spread = parseInt(spread)

      filter.appendChild($('feGaussianBlur', { stdDeviation: blur / 2 }))

      const shadow = $('rect', {
        x: x + offx - spread,
        y: y + offy - spread,
        width: width + spread * 2,
        height: height + spread * 2,
        fill: color,
        rx: borderRadius,
        filter: `url(#${filter.id})`
      })

      g.prepend(shadow)
    }
  }

  // Render border
  if (!borderRadius) {
    for (const [dir, border] of Object.entries(borders ?? {})) {
      const geom = {}
      switch (dir) {
        case 'top':
          geom.x1 = x
          geom.x2 = x + width
          geom.y1 = geom.y2 = y + parseInt(border.width) / 2
          break

        case 'right':
          geom.x1 = geom.x2 = x + width - parseInt(border.width) / 2
          geom.y1 = y
          geom.y2 = y + height
          break

        case 'bottom':
          geom.x1 = x
          geom.x2 = x + width
          geom.y1 = geom.y2 = y + height - parseInt(border.width) / 2
          break

        case 'left':
          geom.x1 = geom.x2 = x + parseInt(border.width) / 2
          geom.y1 = y
          geom.y2 = y + height
          break
      }

      $('line', {
        ...geom,
        stroke: border.color,
        'stroke-width': border.width,
        ...(() => {
          switch (border.style) {
            case 'dotted': return {
              'stroke-dasharray': [0, border.width * 2].join(' '),
              'stroke-dashoffset': 1,
              'stroke-linejoin': 'round',
              'stroke-linecap': 'round'
            }

            case 'dashed': return {
              // https://developer.mozilla.org/en-US/docs/Web/CSS/border-style#dashed
              'stroke-dasharray': [border.width * 2, 4].join(' ')
            }

            default: return {}
          }
        })()
      }, g)
    }
  } else if (borders?.top) {
    // Handle border-radius by drawing the whole border as a standard stroke
    // TODO handle border-radius for specific border-dir.
    // For now, we use borders.top as a placeholder for all borders
    rect.setAttribute('stroke', borders.top.color)
    rect.setAttribute('stroke-width', borders.top.width)

    // Draw border from center
    rect.setAttribute('rx', borderRadius - borders.top.width / 2)
    rect.setAttribute('x', x + borders.top.width / 2)
    rect.setAttribute('y', y + borders.top.width / 2)
    rect.setAttribute('width', width - borders.top.width)
    rect.setAttribute('height', height - borders.top.width)
  }

  return g
}
