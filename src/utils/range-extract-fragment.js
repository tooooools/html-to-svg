// BUG Safari

// Progressively select the content of the node until we get a rectangle
// matching the width of the given rect
export default function (node, rect, offset) {
  const range = document.createRange()
  range.setStart(node, offset)

  let fragment
  let length = 0

  while (offset + (++length) <= node.textContent.length && range.getClientRects()[0]?.width < rect.width) {
    range.setEnd(node, offset + length)
    fragment = range.cloneContents()
  }

  return { fragment, length, range }
}
