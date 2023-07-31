import canvas from './renderers/canvas'
import div from './renderers/div'
import image from './renderers/image'
import svg from './renderers/svg'
import text from './renderers/text'

export {
  div,
  text,
  svg,

  // Match HTMLElement.tagName casing
  div as DIV,
  canvas as CANVAS,
  image as IMG,
  svg as SVG
}
