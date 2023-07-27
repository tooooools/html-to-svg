/* global DocumentFragment */

// Return Range.clientRects with their corresponding DocumentFragment
export default function (node) {
  const range = document.createRange()

  const rects = []
  let y = 0
  for (let i = 0; i < node.textContent.length; i++) {
    range.setStart(node, 0)
    range.setEnd(node, (i + 1))

    const clientRects = range.getClientRects()

    const index = clientRects.length - 1
    rects[index] = rects[index] ?? { text: '' }
    rects[index].rect = clientRects[index]
    rects[index].text += node.textContent.charAt(i)
  }

  return rects.map(rect => {
    rect.fragment = new DocumentFragment()
    rect.fragment.textContent = rect.text
    return rect
  })
}
