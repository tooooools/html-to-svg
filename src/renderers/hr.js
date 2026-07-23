import $ from '../utils/dom-render-svg'
import DivRenderer from './div'

function isTransparent (color) {
  if (!color || color === 'none' || color === 'transparent') return true
  if (color.startsWith('rgba')) return color.match(/[\d.]+/g)?.[3] === '0'
  return false
}

function readBorder (style, side) {
  const color = style.getPropertyValue(`border-${side}-color`)
  const width = parseFloat(style.getPropertyValue(`border-${side}-width`))
  const lineStyle = style.getPropertyValue(`border-${side}-style`)

  if (!width || isNaN(width)) return
  if (isTransparent(color)) return
  if (lineStyle === 'none' || lineStyle === 'hidden') return

  return { color, width, style: lineStyle }
}

function shade (color, amount) {
  const values = color.match(/[\d.]+/g)
  if (!values || values.length < 3) return color

  const channels = values.slice(0, 3).map(value => {
    const channel = parseFloat(value)
    const target = amount < 0 ? 0 : 255
    return Math.round(channel + (target - channel) * Math.abs(amount))
  })

  return values.length > 3
    ? `rgba(${channels.join(', ')}, ${values[3]})`
    : `rgb(${channels.join(', ')})`
}

function strokeProps ({ style, width }) {
  switch (style) {
    case 'dotted': return {
      'stroke-dasharray': `0 ${width * 2}`,
      'stroke-linecap': 'round'
    }
    case 'dashed': return {
      'stroke-dasharray': `${width * 3} ${width * 2}`
    }
    default: return {}
  }
}

function renderBorder (g, side, border, { x, y, width, height }) {
  const horizontal = side === 'top' || side === 'bottom'
  const startSide = side === 'top' || side === 'left'
  const direction = startSide ? 1 : -1
  const edge = horizontal
    ? side === 'top' ? y : y + height
    : side === 'left' ? x : x + width
  const dark = shade(border.color, -0.25)
  const light = shade(border.color, 0.25)

  const addLine = (position, strokeWidth, stroke = border.color) => $('line', {
    x1: horizontal ? x : position,
    x2: horizontal ? x + width : position,
    y1: horizontal ? position : y,
    y2: horizontal ? position : y + height,
    stroke,
    'stroke-width': strokeWidth,
    ...strokeProps({ style: border.style, width: strokeWidth })
  }, g)

  if (border.style === 'double' && border.width >= 3) {
    const strokeWidth = border.width / 3
    addLine(edge + direction * strokeWidth / 2, strokeWidth)
    addLine(edge + direction * (border.width - strokeWidth / 2), strokeWidth)
    return
  }

  if (border.style === 'groove' || border.style === 'ridge') {
    const strokeWidth = border.width / 2
    const groove = border.style === 'groove'
    const outer = groove === startSide ? dark : light
    const inner = groove === startSide ? light : dark

    addLine(
      edge + direction * strokeWidth / 2,
      strokeWidth,
      outer
    )
    addLine(
      edge + direction * (border.width - strokeWidth / 2),
      strokeWidth,
      inner
    )
    return
  }

  const color = border.style === 'inset'
    ? startSide ? dark : light
    : border.style === 'outset'
      ? startSide ? light : dark
      : border.color

  addLine(edge + direction * border.width / 2, border.width, color)
}

export default options => {
  const renderDiv = DivRenderer(options)

  return async (element, props) => {
    const { x, y, width, height, style } = props
    if (!width || !height) return

    const backgroundImage = style.getPropertyValue('background-image')
    const boxShadow = style.getPropertyValue('box-shadow')
    const borderRadius = parseFloat(style.getPropertyValue('border-radius'))

    // Preserve the generic renderer's richer box effects when an <hr> uses them.
    if (
      (backgroundImage && backgroundImage !== 'none') ||
      (boxShadow && boxShadow !== 'none') ||
      borderRadius > 0
    ) return renderDiv(element, props)

    const backgroundColor = style.getPropertyValue('background-color')
    const borders = Object.fromEntries(
      ['top', 'right', 'bottom', 'left']
        .map(side => [side, readBorder(style, side)])
        .filter(([, border]) => border)
    )
    const g = $('g', { class: 'hr' })

    if (!isTransparent(backgroundColor)) {
      $('rect', { x, y, width, height, fill: backgroundColor }, g)
    }

    for (const [side, border] of Object.entries(borders)) {
      renderBorder(g, side, border, { x, y, width, height })
    }

    return g.children.length ? g : undefined
  }
}
