export default function (style) {
  return {
    top: parseFloat(style.getPropertyValue('padding-top')),
    right: parseFloat(style.getPropertyValue('padding-right')),
    bottom: parseFloat(style.getPropertyValue('padding-bottom')),
    left: parseFloat(style.getPropertyValue('padding-left'))
  }
}
