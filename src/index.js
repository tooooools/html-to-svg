/* global Node */
import Opentype from 'opentype.js'
import walk from './utils/dom-walk'
import $ from './utils/render-svg'

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

    // Render the HTML container as a shadow SVG
    compute: async () => {
      const style = window.getComputedStyle(container)
      const viewBox = container.getBoundingClientRect()

      // Create the SVG container
      const svg = $('svg', {
        viewBox: `0 0 ${viewBox.width} ${viewBox.height}`,
        width: viewBox.width,
        height: viewBox.height,
        preserveAspectRatio: 'none'
      })

      // Add a background
      $('rect', {
        x: 0,
        y: 0,
        width: '100%',
        height: '100%',
        class: 'background',
        fill: style.getPropertyValue('background-color') ?? 'white'
      }, svg)

      // Render every children
      await walk(container.children, async element => {
        if (ignore && element.matches(ignore)) return

        const { x, y, width, height } = element.getBoundingClientRect()
        const opts = {
          x: x - viewBox.x,
          y: y - viewBox.y,
          width,
          height,
          style: window.getComputedStyle(element)
        }

        // Render element
        // TODO skip renderer if not is final and visually useless
        const el = await (renderers[element.tagName] ?? renderers.div)(element, opts)
        if (debug) el.setAttribute('data-tag', element.tagName)
        if (el) svg.appendChild(el)

        // Render text // TODO cleanup
        const isFinal = !Array.from(element.children).find(child => window.getComputedStyle(child).getPropertyValue('display') !== 'inline')
        if (isFinal) {
          for (const node of element.childNodes) {
            const range = document.createRange()
            range.selectNodeContents(node)

            let len = 0
            for (const rect of range.getClientRects()) {
              // WIP doc, test
              let content
              const brute = document.createRange()
              brute.setStart(node, len)
              // BUG Safari
              while (len <= node.textContent.length && brute.getClientRects()[0]?.width < rect.width) {
                brute.setEnd(node, len++)
                content = brute.cloneContents()
              }

              if (debug) {
                $('rect', {
                  x: rect.x - viewBox.x,
                  y: rect.y - viewBox.y,
                  width: rect.width,
                  height: rect.height,
                  fill: 'rgb(0 0 0 / 10%)',
                  class: 'debug'
                }, svg)
              }

              try {
                const text = await renderers.text(content, {
                  x: rect.x - viewBox.x,
                  y: rect.y - viewBox.y,
                  width: rect.width,
                  height: rect.height,
                  style: node.nodeType === Node.ELEMENT_NODE
                    ? window.getComputedStyle(node)
                    : opts.style
                })
                if (text) svg.appendChild(text)
              } catch (error) {
                console.warn(new Error(`Rendering failed for the following text:\n'${content.textContent}'`, { cause: error }))
              }
            }
          }
        }

        return true
      })

      return svg
    }
  }
}
