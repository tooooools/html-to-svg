/* global document, window */

const ATOMIC_DISPLAYS = new Set([
  'inline-block',
  'inline-flex',
  'inline-grid',
  'inline-table',
  'inline flow-root'
])
const REPLACED_ELEMENTS = new Set([
  'CANVAS',
  'IFRAME',
  'IMG',
  'SVG',
  'VIDEO'
])

const toRect = rect => ({
  x: rect.x,
  y: rect.y,
  width: rect.width,
  height: rect.height,
  right: rect.x + rect.width,
  bottom: rect.y + rect.height
})

const overlapsVertically = (a, b) =>
  Math.min(a.bottom, b.bottom) > Math.max(a.y, b.y)

function mergeRects (rects, expectedHeight) {
  const lines = []

  for (const rect of rects) {
    let line = lines.find(candidate =>
      candidate.some(other => overlapsVertically(rect, other))
    )

    if (!line) {
      line = []
      lines.push(line)
    }

    line.push(rect)
  }

  const merged = []

  for (const line of lines) {
    const sorted = line.sort((a, b) => a.x - b.x)
    let run = []
    let right = -Infinity

    const flush = () => {
      if (!run.length) return

      const anchor = run.reduce((best, rect) =>
        Math.abs(rect.height - expectedHeight) <
        Math.abs(best.height - expectedHeight)
          ? rect
          : best
      )

      merged.push({
        x: run[0].x,
        y: anchor.y,
        width: right - run[0].x,
        height: anchor.height,
        right,
        bottom: anchor.bottom
      })
      run = []
      right = -Infinity
    }

    for (const rect of sorted) {
      if (run.length && rect.x > right + 1) flush()
      run.push(rect)
      right = Math.max(right, rect.right)
    }

    flush()
  }

  return merged
}

function isAtomic (element, style) {
  const display = style.getPropertyValue('display')
  const position = style.getPropertyValue('position')
  const float = style.getPropertyValue('float')

  return (
    ATOMIC_DISPLAYS.has(display) ||
    REPLACED_ELEMENTS.has(element.tagName) ||
    position === 'absolute' ||
    position === 'fixed' ||
    (float && float !== 'none')
  )
}

function getBlockers (element) {
  if (!element.querySelectorAll) return []

  const blockers = []
  for (const child of element.querySelectorAll('*')) {
    const style = window.getComputedStyle(child)
    if (!isAtomic(child, style)) continue
    blockers.push(...Array.from(child.getClientRects(), toRect))
  }
  return blockers
}

function subtractBlockers (rects, blockers) {
  let result = rects

  for (const blocker of blockers) {
    const next = []

    for (const rect of result) {
      if (!overlapsVertically(rect, blocker)) {
        next.push(rect)
        continue
      }

      const start = Math.max(rect.x, blocker.x)
      const end = Math.min(rect.right, blocker.right)
      if (start >= end) {
        next.push(rect)
        continue
      }

      if (start > rect.x) {
        next.push({
          ...rect,
          width: start - rect.x,
          right: start
        })
      }
      if (end < rect.right) {
        next.push({
          ...rect,
          x: end,
          width: rect.right - end
        })
      }
    }

    result = next
  }

  return result
}

export default function (element, style, font, fontSize) {
  const { unitsPerEm, tables } = font
  const expectedHeight =
    (tables.hhea.ascender - tables.hhea.descender) / unitsPerEm * fontSize
  const display = style.getPropertyValue('display')
  let rects

  if (display === 'inline') {
    rects = Array.from(element.getClientRects(), toRect)
  } else {
    const range = document.createRange()
    range.selectNodeContents(element)
    rects = mergeRects(
      Array.from(range.getClientRects(), toRect)
        .filter(rect => rect.width && rect.height),
      expectedHeight
    )
  }

  return subtractBlockers(rects, getBlockers(element))
}
