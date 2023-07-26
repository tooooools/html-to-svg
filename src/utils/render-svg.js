export default function (name, props = {}, parent) {
  const NS = 'http://www.w3.org/2000/svg'

  const element = document.createElementNS(NS, name)
  if (name === 'svg') element.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', NS)
  for (const key in props) element.setAttribute(key, props[key])

  if (parent) parent.appendChild(element)
  return element
}
