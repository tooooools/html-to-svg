export default el => {
  const zindex = window.getComputedStyle(el).getPropertyValue('z-index')
  return zindex === 'auto' ? 0 : parseInt(zindex ?? 0)
}
