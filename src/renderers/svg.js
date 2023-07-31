/* global XMLSerializer, btoa */
import $ from '../utils/dom-render-svg'

export default ({
  debug,
  fonts
}) => async (element, { x, y, width, height, style }) => $('image', {
  x,
  y,
  width,
  height,
  href: 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(element))
})
