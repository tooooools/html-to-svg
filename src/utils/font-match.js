const matchFont = style => ({
  family,
  style: fontStyle = 'normal',
  weight = '400'
} = {}) =>
  family === (style.getPropertyValue('font-family') ?? '').replace(/['"]/g, '') &&
  fontStyle === (style.getPropertyValue('font-style') ?? 'normal') &&
  weight === (style.getPropertyValue('font-weight') ?? '400')

export default (fonts, style) => fonts.find(matchFont(style))
