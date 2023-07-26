import $ from '../utils/render-svg'

export default ({
  CACHE,
  debug,
  fonts
}) => async (element, { x, y, width, height, style }) => $('rect', {
  x,
  y,
  width,
  height,
  fill: style.getPropertyValue('background-color'),
  rx: style.getPropertyValue('border-radius')
})
