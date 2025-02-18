/* global Node */
import getClientRects from './range-get-client-rects'

export default function (element) {
  if (!element) return
  if (!element.innerText) return
  if (!element.childNodes.length) return

  let fragments = []

  for (const node of element.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue
    if (!node.textContent.length) continue

    // Text interface does not provide a .innerText method, which would be
    // more appropriate than textContent as it skips non-rendered whitespaces
    // Splitting white-space leading Text trick the browser to recompute
    // the layout itself, dealing with implicit space between adjacent nodes
    if (/^\s/.test(node.textContent)) node.splitText(1)

    fragments = fragments.concat(getClientRects(node))
  }

  return fragments
}
