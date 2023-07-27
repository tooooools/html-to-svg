import $ from '../utils/dom-render-svg'

export default ({
  CACHE,
  debug,
  fonts
}) => async (element, { x, y, width, height, style }) => {
  if (!width || !height) return
  if (!element.src) return

  return $('image', {
    x,
    y,
    width,
    height,
    href: element.src
  })
}
