import $ from '../utils/dom-render-svg'

export default ({
  debug,
  fonts
}) => async (element, { x, y, width, height, style }) => {
  if (!width || !height) return

  // TODO background-image
  // TODO border
  const backgroundColor = style.getPropertyValue('background-color')

  // Skip visually empty blocks
  if (!backgroundColor || backgroundColor === 'none' || backgroundColor === 'transparent') return
  if (backgroundColor.startsWith('rgba')) {
    const rgba = backgroundColor.match(/[\d.]+/g)
    if (rgba[3] === '0') return
  }

  return $('rect', {
    x,
    y,
    width,
    height,
    fill: backgroundColor,
    rx: parseInt(style.getPropertyValue('border-radius')) || null
  })
}
