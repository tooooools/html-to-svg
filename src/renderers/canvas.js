import $ from '../utils/render-svg'

export default ({
  CACHE,
  debug,
  fonts
}) => async (element, { x, y, width, height, style }) => $('image', {
  x,
  y,
  width,
  height,
  href: element.toDataURL('image/png')
})
