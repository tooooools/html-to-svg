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
  const CACHE = new Map()

  // Init curried renderers
  const renderers = {}
  for (const k in RENDERERS) {
    renderers[k] = RENDERERS[k]({ CACHE, debug, fonts })
  }

  return {
    // Preload all fonts before resolving
    preload: async () => {
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
    unload: async () => {
      CACHE.clear()
      for (const font of fonts) delete font.opentype
    },

    // Render the HTML container as a shadow SVG
    compute: async () => {
      const viewBox = container.getBoundingClientRect()

      // Create the SVG container
      const svg = $('svg', {
        viewBox: `0 0 ${viewBox.width} ${viewBox.height}`,
        width: viewBox.width,
        height: viewBox.height,
        preserveAspectRatio: 'none'
      })

      // Render every children
      // TODO opacity
      await walk(container, async element => {
        if (ignore && element.matches(ignore)) return

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
        for (const node of element.childNodes) {
          if (node.nodeType !== Node.TEXT_NODE) continue
          if (!node.textContent.trim().replace(/\s+/g, '').length) continue

          for (const { rect, fragment } of getClientRects(node)) {
            try {
              // WIP
              if (rect.x === x + parseFloat(style.getPropertyValue('padding-left') || 0)) fragment.textContent = fragment.textContent.trimStart()

              const text = await renderers.text(fragment, {
                x: rect.x - viewBox.x,
                y: rect.y - viewBox.y,
                width: rect.width,
                height: rect.height,
                style
              })
              if (text) svg.appendChild(text)
            } catch (error) {
              console.warn(new Error(`Rendering failed for the following text:\n'${fragment.textContent}'`, { cause: error }))
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
