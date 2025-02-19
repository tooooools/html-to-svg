import Opentype from 'opentype.js'
import { uid } from 'uid'

import walk from './utils/dom-walk'
import getZIndex from './utils/dom-get-zindex'
import getTextFragments from './utils/dom-get-text-fragments'
import parseTransform from './utils/parse-transform'
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
    render: async function (root, options = {}, transform) {
      const viewBox = root.getBoundingClientRect()

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
      await walk(root, async (element, depth, index) => {
        if (ignore && element !== root && element.matches(ignore)) return
        Context.apply(depth)

        // Extract geometric and style data from element
        const style = window.getComputedStyle(element)
        const matrix = element !== root && parseTransform(style.getPropertyValue('transform'))
        const opacity = style.getPropertyValue('opacity')
        const clipPath = style.getPropertyValue('clip-path')
        const overflow = style.getPropertyValue('overflow')

        // Temporarily remove transformation to simplify coordinates calc
        if (matrix) element.style.transform = 'none'
        const { x, y, width, height } = element.getBoundingClientRect()

        // Create a new context
        if (
          +opacity !== 1 ||
          matrix ||
          overflow === 'hidden' ||
          clipPath !== 'none'
        ) Context.push()

        // Handle opacity
        if (+opacity !== 1) {
          Context.current.setAttribute('opacity', opacity)
        }

        // Handle transformation
        if (matrix) {
          Context.current.setAttribute('transform', matrix.toSVGTransform({
            x: x - viewBox.x,
            y: y - viewBox.y,
            origin: style.getPropertyValue('transform-origin')
              .split(' ')
              .map(v => parseFloat(v))
          }))
        }

        // Handle overflow: hidden
        if (overflow === 'hidden') {
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
        if (clipPath !== 'none') {
          // WARNING: CSS clip-path implementation is not done yet on arnaudjuracek/svg-to-pdf
          Context.current.setAttribute('style', `clip-path: ${clipPath.replace(/"/g, "'")}`)
        }

        // Render element
        const render = renderers[element.tagName] ?? renderers.div
        let rendered = await render(element, {
          x: x - viewBox.x,
          y: y - viewBox.y,
          width,
          height,
          style,
          viewBox,
          defs
        }, options)

        if (transform) rendered = await transform(element, rendered)
        if (rendered) Context.current.appendChild(rendered)

        // Render text nodes inside the element
        const g = $('g', { class: 'text' })
        for (const { rect, fragment } of getTextFragments(element) ?? []) {
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

        if (g.children.length) Context.current.appendChild(g)

        // Restore removed transformation if any
        if (matrix) element.style.transform = matrix.raw
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
