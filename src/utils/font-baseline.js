export default function (font, fontSize, y) {
  const { unitsPerEm } = font
  const { ascender, descender } = font.tables.hhea
  const lineBox = (ascender - descender) / unitsPerEm
  const leading = (fontSize * lineBox) -
    Math.abs(descender / unitsPerEm) * fontSize

  return y + leading
}
