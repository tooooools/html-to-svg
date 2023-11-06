/* global FileReader, XMLSerializer, btoa, XMLHttpRequest */
import $ from '../utils/dom-render-svg'

export default ({ cache }) => async (element, { x, y, width, height, style }, {
  rasterizeNestedSVG = true
} = {}) => {
  // Convert all image to dataURL to maximizime compatibility
  for (const image of element.querySelectorAll('image[href]')) {
    const src = image.getAttribute('href')

    if (!cache.has(src)) {
      // Fetch blob from image src
      const blob = await new Promise(resolve => {
        const request = new XMLHttpRequest()
        request.open('GET', src, true)
        request.responseType = 'blob'
        request.onload = () => resolve(request.response)
        request.send()
      })

      // Convert blob to dataURL using the FileReader API
      const dataURL = await new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.readAsDataURL(blob)
      })

      // Cache dataURL
      cache.set(src, dataURL)
    }

    image.setAttribute('href', cache.get(src))
  }

  return rasterizeNestedSVG
    ? $('image', {
      x,
      y,
      width,
      height,
      href: 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(element))
    })
    : (() => {
        const svg = $('svg', {
          x,
          y,
          width,
          height,
          viewbox: `0 0 ${width} ${height}`
        })

        svg.innerHTML = element.innerHTML
        return svg
      })()
}
