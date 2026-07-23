const DECORATION_LINES = new Set(['underline', 'overline', 'line-through'])

export default function (style) {
  if (style.getPropertyValue('display') === 'contents') return

  const lines = style.getPropertyValue('text-decoration-line')
    .split(/\s+/)
    .filter(line => DECORATION_LINES.has(line))

  if (!lines.length) return

  return {
    lines,
    color: style.getPropertyValue('text-decoration-color'),
    style: style.getPropertyValue('text-decoration-style'),
    thickness: style.getPropertyValue('text-decoration-thickness'),
    underlineOffset: style.getPropertyValue('text-underline-offset')
  }
}
