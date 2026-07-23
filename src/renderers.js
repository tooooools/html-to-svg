import canvas from './renderers/canvas'
import div from './renderers/div'
import hr from './renderers/hr'
import image from './renderers/image'
import span from './renderers/span'
import svg from './renderers/svg'
import text from './renderers/text'

export {
  div,
  text,
  svg,

  // Match HTMLElement.tagName casing
  div as DIV,
  hr as HR,
  span as MARK,
  span as SPAN,
  canvas as CANVAS,
  image as IMG,
  svg as SVG
}
