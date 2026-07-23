import { load as loadOpentypeFont } from 'opentype.js'
import { uid } from 'uid'

import walk from './utils/dom-walk'
import getZIndex from './utils/dom-get-zindex'
import getTextFragments from './utils/dom-get-text-fragments'
import getTextDecoration from './utils/dom-get-text-decoration'
import getTextDecorationRects from './utils/dom-get-text-decoration-rects'
import renderTextDecoration from './utils/dom-render-text-decoration'
import getFontBaseline from './utils/font-baseline'
import findFont from './utils/font-match'
import parseTransform from './utils/parse-transform'
import lastOf from './utils/array-last'

import $ from './utils/dom-render-svg'
import * as RENDERERS from './renderers'

function renderTextDecorationLayer ({
  element,
  style,
  font,
  viewBox,
  decoration,
  lines
}) {
  const selectedLines = decoration.lines.filter(line => lines.includes(line))
  if (!selectedLines.length) return

  const fontSize = parseFloat(style.getPropertyValue('font-size'))
  const g = $('g', { class: 'text-decoration-layer' })

  for (const rect of getTextDecorationRects(element, style, font, fontSize)) {
    const rendered = renderTextDecoration({
      x: rect.x - viewBox.x,
      width: rect.width,
      baseline: getFontBaseline(font, fontSize, rect.y - viewBox.y),
      fontSize,
      font,
      color: style.getPropertyValue('color'),
      decorations: [{ ...decoration, lines: selectedLines }]
    })

    if (rendered) g.appendChild(rendered)
  }

  return g.children.length ? g : undefined
}

export default function ({
  debug = false,
  ignore = '',
  fonts = []
} = {}) {
  const cache = new Map()
  const detransformed = new Map()

  // Init curried renderers
  const renderers = {}
  for (const k in RENDERERS) {
    renderers[k] = RENDERERS[k]({ debug, fonts, cache })
  }

  // Restore all removed transformation if any
  const cleanup = () => {
    for (const [element, transform] of detransformed) {
      element.style.transform = transform
      detransformed.delete(element)
    }
  }

  return {
    get cache () { return cache },
    cleanup,

    // Preload all fonts before resolving
    preload: async function () {
      for (const font of fonts) {
        if (font.opentype) continue
        font.opentype = await new Promise(resolve => {
          loadOpentypeFont(font.url, (error, font) => {
            if (error) throw error
            resolve(font)
          })
        })
      }
    },

    // Clear cache and delete all resources
    destroy: function () {
      cache.clear()
      cleanup()
      for (const font of fonts) delete font.opentype
    },

    // Render the HTML container as a shadow SVG
    render: async function (root, options = {}, transform) {
      cleanup()
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

      const foregroundDecorations = []

      // Render every children
      await walk(root, async (element, depth, index) => {
        if (ignore && element !== root && element.matches(ignore)) return
        Context.apply(depth)

        // Extract geometric and style data from element
        const style = window.getComputedStyle(element)
        const matrix = element !== root && parseTransform(style.getPropertyValue('transform'))
        const opacity = style.getPropertyValue('opacity')
        const mixBlendMode = style.getPropertyValue('mix-blend-mode')
        const clipPath = style.getPropertyValue('clip-path')
        const overflow = style.getPropertyValue('overflow')
        const decoration = getTextDecoration(style)

        // Temporarily remove transformation to simplify coordinates calc
        if (matrix) {
          // WARNING this will cause issues with concurent renderings:
          // <renderer>#cleanup is called before to ensure purity
          detransformed.set(element, element.style.transform)
          // Keep a non-none identity transform so positioned descendants retain
          // the transformed element as their containing block.
          element.style.transform = 'matrix(1, 0, 0, 1, 0, 0)'
        }

        const { x, y, width, height } = element.getBoundingClientRect()

        // Create a new context
        if (
          +opacity !== 1 ||
          matrix ||
          mixBlendMode !== 'normal' ||
          overflow === 'hidden' ||
          clipPath !== 'none' ||
          decoration
        ) Context.push()

        const elementContext = Context.current

        // Handle opacity
        if (+opacity !== 1) {
          Context.current.setAttribute('opacity', opacity)
        }

        // Handle mix-blend-mode
        if (mixBlendMode !== 'normal') {
          Context.current.style.mixBlendMode = mixBlendMode
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
        if (rendered) elementContext.appendChild(rendered)

        if (decoration) {
          const font = findFont(fonts, style)?.opentype

          if (font) {
            let below = renderTextDecorationLayer({
              element,
              style,
              font,
              viewBox,
              decoration,
              lines: ['underline', 'overline']
            })
            let above = renderTextDecorationLayer({
              element,
              style,
              font,
              viewBox,
              decoration,
              lines: ['line-through']
            })

            if (transform) {
              if (below) below = await transform(element, below)
              if (above) above = await transform(element, above)
            }

            if (below) elementContext.appendChild(below)
            if (above) {
              foregroundDecorations.push({
                context: elementContext,
                rendered: above
              })
            }
          }
        }

        // Render text nodes inside the element
        const g = $('g', { class: 'text' })
        const textFragments = getTextFragments(element) ?? []

        for (const { rect, fragment } of textFragments) {
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

        if (g.children.length) elementContext.appendChild(g)
      }, {
        sort: (a, b) => {
          a.zIndex ??= getZIndex(a)
          b.zIndex ??= getZIndex(b)
          return a.zIndex - b.zIndex
        }
      })

      for (const { context, rendered } of foregroundDecorations) {
        context.appendChild(rendered)
      }

      cleanup()
      return svg
    }
  }
}
