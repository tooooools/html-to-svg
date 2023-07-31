/* global Node */
import Opentype from 'opentype.js'
import walk from './utils/dom-walk'
import getClientRects from './utils/range-get-client-rects'

import $ from './utils/dom-render-svg'
import * as RENDERERS from './renderers'

export default function (container = document.body, {
  debug = false,
  ignore = '',
  fonts = []
} = {}) {
  // Init curried renderers
  const renderers = {}
  for (const k in RENDERERS) {
    renderers[k] = RENDERERS[k]({ debug, fonts })
  }

  return {
    // Preload all fonts before resolving
    preload: async function () {
      for (const font of fonts) {
        if (font.opentype) continue
        font.opentype = await new Promise(resolve => {
          Opentype.load(font.url, (error, font) => {
            if (error) throw error
            resolve(font)
          })
        })
      }
    },

    // Clear cache and delete all resources
    flush: function () {
      for (const font of fonts) delete font.opentype
    },

    // Render the HTML container as a shadow SVG
    compute: async function () {
      const viewBox = container.getBoundingClientRect()

      // Create the SVG container
      const svg = $('svg', {
        viewBox: `0 0 ${viewBox.width} ${viewBox.height}`,
        width: viewBox.width,
        height: viewBox.height,
        preserveAspectRatio: 'none'
      })

      // Render every children
      await walk(container, async element => {
        if (ignore && element !== container && element.matches(ignore)) return

        // TODO opacity
        const style = window.getComputedStyle(element)
        const { x, y, width, height } = element.getBoundingClientRect()

        // Render element
        const render = renderers[element.tagName] ?? renderers.div
        const rendered = await render(element, {
          x: x - viewBox.x,
          y: y - viewBox.y,
          width,
          height,
          style
        })
        if (rendered) svg.appendChild(rendered)

        // Render text nodes inside the element
        if (element.innerText) {
          for (const node of element.childNodes) {
            if (node.nodeType !== Node.TEXT_NODE) continue
            if (!node.textContent.length) continue

            // Text interface does not provide a .innerText method, which would be
            // more appropriate than textContent as it skips non-rendered whitespaces
            // Splitting white-space leading Text trick the browser to recompute
            // the layout itself, dealing with implicit space between adjacent nodes
            if (/^\s/.test(node.textContent)) {
              node.splitText(1)
              continue
            }

            for (const { rect, fragment } of getClientRects(node)) {
              try {
                const text = await renderers.text(fragment.textContent.trimEnd(), {
                  x: rect.x - viewBox.x,
                  y: rect.y - viewBox.y,
                  width: rect.width,
                  height: rect.height,
                  style
                })
                if (text) svg.appendChild(text)
              } catch (error) {
                // TODO[improve] error handling
                console.warn(new Error(`Rendering failed for the following text: '${fragment.textContent}'`, { cause: error }))
                console.warn(error)
              }
            }
          }
        }

        // Continue walking
        return true
      })

      return svg
    }
  }
}
