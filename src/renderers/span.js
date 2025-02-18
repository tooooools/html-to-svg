import $ from '../utils/dom-render-svg'
import getTextFragments from '../utils/dom-get-text-fragments'

import DivRenderer from './div'

const SpanRenderer = ({ debug, fonts }) => async (element, { x, y, width, height, style, viewBox }, options) => {
  const g = $('g', null)

  // Render every child node as a span
  const renderSpan = SpanRenderer({ debug, fonts })
  for (const node of element.childNodes) {
    g.appendChild(await renderSpan(node, { x, y, width, height, style, viewBox }, options))
  }

  // Render every text fragment using the div renderer (background etc)
  const renderDiv = DivRenderer({ debug, fonts })
  for (const { rect } of getTextFragments(element) ?? []) {
    const rendered = await renderDiv(element, {
      x: rect.x - viewBox.x,
      y: rect.y - viewBox.y,
      width: rect.width,
      height: rect.height,
      style,
      viewBox
    }, options)

    if (rendered) g.appendChild(rendered)
  }

  return g
}

export default SpanRenderer
