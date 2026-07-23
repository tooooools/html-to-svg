import { parse as parseOpentypeFont } from 'opentype.js'

const COLLECTION_SIGNATURE = 'ttcf'
const COLLECTION_FACE_LIMIT = 4096
const FONT_SIZE_LIMIT = 128 * 1024 * 1024
const SFNT_HEADER_SIZE = 12
const TABLE_COUNT_LIMIT = 256
const TABLE_RECORD_SIZE = 16
const align4 = value => Math.ceil(value / 4) * 4

function assertRange (start, length, total, description) {
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(length) ||
    start < 0 ||
    length < 0 ||
    start + length > total
  ) throw new Error(`Invalid ${description}`)
}

function tag (view, offset) {
  assertRange(offset, 4, view.byteLength, 'font signature')
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3)
  )
}

function fontName (font, name) {
  const values = font.names?.[name]
  if (!values) return
  return values.en ?? Object.values(values)[0]
}

function fontStyle (fontData, font) {
  const name = fontData.style?.toLowerCase() ?? ''
  if (name.includes('italic')) return 'italic'
  if (name.includes('oblique')) return 'oblique'

  const fsSelection = font.tables.os2?.fsSelection ?? 0
  const macStyle = font.tables.head?.macStyle ?? 0
  if (fsSelection & 512) return 'oblique'
  return (fsSelection & 1) || (macStyle & 2) ? 'italic' : 'normal'
}

function fontWeight (fontData, font) {
  const tableWeight = font.tables.os2?.usWeightClass
  if (tableWeight) return String(tableWeight)

  const name = (fontData.style ?? '').toLowerCase().replace(/[\s_-]/g, '')
  const namedWeights = [
    ['extralight', '200'],
    ['ultralight', '200'],
    ['semibold', '600'],
    ['demibold', '600'],
    ['extrabold', '800'],
    ['ultrabold', '800'],
    ['thin', '100'],
    ['light', '300'],
    ['medium', '500'],
    ['black', '900'],
    ['heavy', '900'],
    ['bold', '700']
  ]
  const named = namedWeights.find(([weight]) => name.includes(weight))
  if (named) return named[1]

  return font.tables.head?.macStyle & 1 ? '700' : '400'
}

function descriptor (fontData, font) {
  return {
    family:
      fontData.family ??
      fontName(font, 'preferredFamily') ??
      fontName(font, 'fontFamily'),
    fullName: fontData.fullName ?? fontName(font, 'fullName'),
    postscriptName:
      fontData.postscriptName ??
      fontName(font, 'postScriptName'),
    style: fontStyle(fontData, font),
    weight: fontWeight(fontData, font),
    local: true,
    opentype: font
  }
}

function extractCollectionFace (buffer, faceOffset) {
  const view = new DataView(buffer)
  assertRange(
    faceOffset,
    SFNT_HEADER_SIZE,
    buffer.byteLength,
    'font collection face'
  )

  const tableCount = view.getUint16(faceOffset + 4)
  if (!tableCount || tableCount > TABLE_COUNT_LIMIT) {
    throw new Error('Invalid font table count')
  }
  const directoryLength =
    SFNT_HEADER_SIZE + tableCount * TABLE_RECORD_SIZE
  assertRange(
    faceOffset,
    directoryLength,
    buffer.byteLength,
    'font table directory'
  )

  const tables = []
  let outputLength = align4(directoryLength)

  for (let index = 0; index < tableCount; index++) {
    const recordOffset =
      faceOffset + SFNT_HEADER_SIZE + index * TABLE_RECORD_SIZE
    const tableOffset = view.getUint32(recordOffset + 8)
    const tableLength = view.getUint32(recordOffset + 12)
    assertRange(
      tableOffset,
      tableLength,
      buffer.byteLength,
      'font table'
    )

    outputLength += align4(tableLength)
    if (outputLength > FONT_SIZE_LIMIT) {
      throw new Error('Font collection face is too large')
    }

    tables.push({ recordOffset, tableOffset, tableLength })
  }

  // OpenType.js does not read collections. Rebuild this face as a temporary
  // standalone SFNT, retaining table bytes and rewriting their file offsets.
  const output = new ArrayBuffer(outputLength)
  const outputBytes = new Uint8Array(output)
  const outputView = new DataView(output)
  outputBytes.set(
    new Uint8Array(buffer, faceOffset, SFNT_HEADER_SIZE),
    0
  )

  let outputTableOffset = align4(directoryLength)
  for (let index = 0; index < tables.length; index++) {
    const { recordOffset, tableOffset, tableLength } = tables[index]
    const outputRecordOffset =
      SFNT_HEADER_SIZE + index * TABLE_RECORD_SIZE

    outputBytes.set(
      new Uint8Array(buffer, recordOffset, 8),
      outputRecordOffset
    )
    outputView.setUint32(outputRecordOffset + 8, outputTableOffset)
    outputView.setUint32(outputRecordOffset + 12, tableLength)
    outputBytes.set(
      new Uint8Array(buffer, tableOffset, tableLength),
      outputTableOffset
    )
    outputTableOffset += align4(tableLength)
  }

  return output
}

function parseCollection (buffer, postscriptName) {
  const view = new DataView(buffer)
  assertRange(0, SFNT_HEADER_SIZE, buffer.byteLength, 'font collection header')

  const faceCount = view.getUint32(8)
  if (!faceCount || faceCount > COLLECTION_FACE_LIMIT) {
    throw new Error('Invalid font collection face count')
  }
  assertRange(
    SFNT_HEADER_SIZE,
    faceCount * 4,
    buffer.byteLength,
    'font collection offsets'
  )

  let firstFont
  let parseError

  for (let index = 0; index < faceCount; index++) {
    const faceOffset = view.getUint32(SFNT_HEADER_SIZE + index * 4)

    try {
      const font = parseOpentypeFont(
        extractCollectionFace(buffer, faceOffset)
      )
      firstFont ??= font

      if (
        !postscriptName ||
        fontName(font, 'postScriptName') === postscriptName
      ) return font
    } catch (error) {
      parseError = error
    }
  }

  if (!postscriptName && firstFont) return firstFont
  throw new Error(
    `Font collection does not contain '${postscriptName}'`,
    { cause: parseError }
  )
}

function parseFont (buffer, postscriptName) {
  const view = new DataView(buffer)
  return tag(view, 0) === COLLECTION_SIGNATURE
    ? parseCollection(buffer, postscriptName)
    : parseOpentypeFont(buffer)
}

export default async function (fontData) {
  const loaded = []

  for (const data of Array.from(fontData ?? [])) {
    const name = data?.postscriptName ?? data?.fullName ?? 'unknown'

    if (!data || typeof data.blob !== 'function') {
      throw new TypeError(`Invalid local font data '${name}'`)
    }

    try {
      const blob = await data.blob()
      const font = parseFont(await blob.arrayBuffer(), data.postscriptName)
      loaded.push(descriptor(data, font))
    } catch (error) {
      throw new Error(`Failed to parse local font '${name}'`, { cause: error })
    }
  }

  return loaded
}
