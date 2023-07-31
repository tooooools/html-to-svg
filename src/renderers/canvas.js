import $ from '../utils/dom-render-svg'

export default ({
  debug,
  fonts
}) => async (element, { x, y, width, height, style }) => $('image', {
  x,
  y,
  width,
  height,
  href: element.toDataURL('image/png')
})
