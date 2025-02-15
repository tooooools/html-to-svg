/* global Node */
import Opentype from 'opentype.js'
import { uid } from 'uid'
import walk from './utils/dom-walk'
import getZIndex from './utils/dom-get-zindex'
import getClientRects from './utils/range-get-client-rects'
import lastOf from './utils/array-last'

import $ from './utils/dom-render-svg'
import * as RENDERERS from './renderers'

export default function ({
  debug = false,
  ignore = '',
  fonts = []
} = {}) {
  const cache = new Map()

  // Init curried renderers
  const renderers = {}
  for (const k in RENDERERS) {
    renderers[k] = RENDERERS[k]({ debug, fonts, cache })
  }

  return {
    get cache () { return cache },

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
    destroy: function () {
      cache.clear()
      for (const font of fonts) delete font.opentype
    },

    // Render the HTML container as a shadow SVG
    render: async function (container, options = {}, transform) {
      const viewBox = container.getBoundingClientRect()

      // Create the SVG container
      const svg = $('svg', {
        viewBox: `0 0 ${viewBox.width} ${viewBox.height}`,
        width: viewBox.width,
        height: viewBox.height,
        preserveAspectRatio: 'none'
      })

      const defs = $('defs', null, svg)

      // Set context to root SVG.
      // Context will change during walk push/pop
      const Context = (() => {
        const stack = [svg]
        const pop = () => stack.length > 0 && stack.pop()
        const push = () => stack.push($('g', null, lastOf(stack)))
        return {
          pop,
          push,
          get current () { return lastOf(stack) },
          apply: depth => {
            const deltaDepth = depth - (stack.length - 1)
            for (let i = 0; i < -deltaDepth; i++) pop()
            for (let i = 0; i < deltaDepth; i++) push()
          }
        }
      })()

      // Render every children
      await walk(container, async (element, depth, index) => {
        if (ignore && element !== container && element.matches(ignore)) return
        Context.apply(depth)

        // Extract geometric and styling data from element
        const style = window.getComputedStyle(element)
        const { x, y, width, height } = element.getBoundingClientRect()
        const clipPathValue = style.getPropertyValue('clip-path')
        const overflowValue = style.getPropertyValue('overflow')

        if (overflowValue || clipPathValue) Context.push()

        // Handle overflow: hidden
        if (overflowValue === 'hidden') {
          const clipPath = $('clipPath', { id: 'clip_' + uid() }, defs, [
            $('rect', {
              x: x - viewBox.x,
              y: y - viewBox.y,
              width,
              height
            })
          ])

          Context.current.setAttribute('clip-path', `url(#${clipPath.id})`)
        }

        // Handle CSS clip-path property
        if (clipPathValue !== 'none') {
          // WARNING: CSS clip-path implementation is not done yet on arnaudjuracek/svg-to-pdf
          Context.current.setAttribute('style', `clip-path: ${clipPathValue.replace(/"/g, "'")}`)
        }

        // Render element
        const render = renderers[element.tagName] ?? renderers.div
        let rendered = await render(element, {
          x: x - viewBox.x,
          y: y - viewBox.y,
          width,
          height,
          style
        }, options)

        if (transform) rendered = await transform(element, rendered)
        if (rendered) Context.current.appendChild(rendered)

        // Render text nodes inside the element
        if (element.innerText && element.childNodes.length) {
          const g = $('g', { class: 'text' })

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
                let text = await renderers.text(fragment.textContent.trimEnd(), {
                  x: rect.x - viewBox.x,
                  y: rect.y - viewBox.y,
                  width: rect.width,
                  height: rect.height,
                  style
                }, options)

                if (transform) text = await transform(element, text)
                if (text) g.appendChild(text)
              } catch (error) {
                // TODO[improve] error handling
                console.warn(new Error(`Rendering failed for the following text: '${fragment.textContent}'`, { cause: error }))
                console.warn(error)
              }
            }
          }

          if (g.children.length) Context.current.appendChild(g)
        }
      }, {
        sort: (a, b) => {
          a.zIndex ??= getZIndex(a)
          b.zIndex ??= getZIndex(b)
          return a.zIndex - b.zIndex
        }
      })

      return svg
    }
  }
}
