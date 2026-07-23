import $ from '../utils/dom-render-svg'
import getFontBaseline from '../utils/font-baseline'
import findFont from '../utils/font-match'

export default ({ debug, fonts }) => async (string, {
  x,
  y,
  width,
  height,
  style
}, {
  splitText = false
}) => {
  if (!string) return

  const g = $('g', { class: 'text-fragment' })

  // Find font
  const font = findFont(fonts, style)
  if (!font) throw new Error(`Cannot find font '${style.getPropertyValue('font-family')} ${style.getPropertyValue('font-style')} ${style.getPropertyValue('font-weight')}'`)

  // Extract CSS props
  const letterSpacing = style.getPropertyValue('letter-spacing')
  const fontSize = parseFloat(style.getPropertyValue('font-size'))

  // Compute metrics
  const baseline = getFontBaseline(font.opentype, fontSize, y)
  const leading = baseline - y

  // Render various metrics for debug
  line('start', 0, { orientation: 'vertical', stroke: 'red' })
  line('end', width, { orientation: 'vertical', stroke: 'red' })
  line('leading', leading, { stroke: '#4b96ff' })

  if (letterSpacing !== 'normal' || splitText) {
    const ls = letterSpacing === 'normal' ? 0 : parseFloat(letterSpacing)

    // Render letter by letter in case of non-default letter-spacing or explicit split
    for (const c of string) {
      if (!c.match(/\s/)) { // Do not render spaces
        $('path', {
          d: font.opentype.getPath(c, x, baseline, fontSize).toPathData(3),
          fill: style.getPropertyValue('color')
        }, g)
      }

      x += font.opentype.getAdvanceWidth(c, fontSize) + ls
    }
  } else {
    // Render string
    $('path', {
      d: font.opentype.getPath(string, x, baseline, fontSize, {
        features: {
          // TODO extract from CSS props
          liga: true,
          rlig: true
        }
      }).toPathData(3),
      fill: style.getPropertyValue('color')
    }, g)
  }

  return g

  function line (title, v, { orientation = 'horizontal', stroke = 'black' } = {}) {
    return debug && $('line', {
      title,
      'data-value': v,
      x1: orientation === 'horizontal' ? x : x + v,
      x2: orientation === 'horizontal' ? x + width : x + v,
      y1: orientation === 'horizontal' ? y + v : y,
      y2: orientation === 'horizontal' ? y + v : y + height,
      stroke,
      class: 'debug'
    }, g)
  }
}
