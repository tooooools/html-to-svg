const assert = require('assert').strict
const { Blob } = require('buffer')
const fs = require('fs')
const path = require('path')

const HtmlToSvg = require('../dist/html-to-svg.js')

const bytes = fs.readFileSync(
  path.resolve(__dirname, '../example/fonts/ahem.ttf')
)
const robotoBytes = fs.readFileSync(
  path.resolve(__dirname, '../example/fonts/roboto-regular.ttf')
)

const align4 = value => Math.ceil(value / 4) * 4

function fontCollection (...fonts) {
  const headerLength = 12 + fonts.length * 4
  const offsets = []
  let collectionLength = align4(headerLength)

  for (const font of fonts) {
    offsets.push(collectionLength)
    collectionLength = align4(collectionLength + font.length)
  }

  const collection = Buffer.alloc(collectionLength)

  collection.write('ttcf', 0, 'ascii')
  collection.writeUInt32BE(0x00010000, 4)
  collection.writeUInt32BE(fonts.length, 8)

  for (let face = 0; face < fonts.length; face++) {
    const font = fonts[face]
    const faceOffset = offsets[face]
    collection.writeUInt32BE(faceOffset, 12 + face * 4)
    font.copy(collection, faceOffset)
    const tableCount = font.readUInt16BE(4)

    for (let index = 0; index < tableCount; index++) {
      const sourceRecord = 12 + index * 16
      const collectionRecord = faceOffset + sourceRecord
      collection.writeUInt32BE(
        font.readUInt32BE(sourceRecord + 8) + faceOffset,
        collectionRecord + 8
      )
    }
  }

  return collection
}

function localFont ({
  family = 'Ahem',
  fullName = 'Ahem',
  postscriptName = 'Ahem',
  style = 'Regular',
  contents = bytes
} = {}) {
  return {
    family,
    fullName,
    postscriptName,
    style,
    blob: async () => new Blob([contents])
  }
}

async function main () {
  const concurrentRenderer = new HtmlToSvg()
  const concurrent = await Promise.all([
    concurrentRenderer.addLocalFonts([localFont()]),
    concurrentRenderer.addLocalFonts([localFont()])
  ])
  assert.equal(concurrent[0].length + concurrent[1].length, 1)
  concurrentRenderer.destroy()

  const renderer = new HtmlToSvg()
  const added = await renderer.addLocalFonts([localFont()])

  assert.equal(added.length, 1)
  assert.equal(added[0].family, 'Ahem')
  assert.equal(added[0].fullName, 'Ahem')
  assert.equal(added[0].postscriptName, 'Ahem')
  assert.equal(added[0].style, 'normal')
  assert.equal(added[0].weight, '400')
  assert.equal(added[0].local, true)
  assert.equal(typeof added[0].opentype.getPath, 'function')

  assert.deepEqual(await renderer.addLocalFonts([localFont()]), [])
  assert.deepEqual(await renderer.addLocalFonts([{
    postscriptName: 'Ahem',
    blob: async () => {
      throw new Error('duplicate blobs must not be read')
    }
  }]), [])

  await assert.rejects(
    renderer.addLocalFonts([
      localFont({ postscriptName: 'AhemTwo' }),
      localFont({
        fullName: 'Broken',
        postscriptName: 'Broken',
        contents: new Uint8Array([0, 1, 2, 3])
      })
    ]),
    /Failed to parse local font 'Broken'/
  )

  const afterFailure = await renderer.addLocalFonts([
    localFont({ postscriptName: 'AhemTwo', style: 'Italic' })
  ])
  assert.equal(afterFailure.length, 1)
  assert.equal(afterFailure[0].style, 'italic')

  renderer.destroy()
  assert.equal(afterFailure[0].opentype, undefined)

  const collection = await renderer.addLocalFonts([
    localFont({
      contents: fontCollection(bytes, robotoBytes),
      family: 'Roboto',
      fullName: 'Roboto Regular',
      postscriptName: 'Roboto-Regular'
    })
  ])
  assert.equal(collection.length, 1)
  assert.equal(collection[0].postscriptName, 'Roboto-Regular')

  await assert.rejects(
    renderer.addLocalFonts([
      localFont({
        contents: fontCollection(bytes, robotoBytes),
        postscriptName: 'MissingFace'
      })
    ]),
    error => {
      assert.match(error.message, /Failed to parse local font 'MissingFace'/)
      assert.match(
        error.cause.message,
        /Font collection does not contain 'MissingFace'/
      )
      return true
    }
  )
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
