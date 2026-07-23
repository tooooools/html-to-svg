const assert = require('assert').strict
const path = require('path')

const { installDOM, style } = require(
  path.resolve(__dirname, 'helpers/fake-dom.js')
)
const getTextDecoration = require(
  path.resolve(__dirname, '../src/utils/dom-get-text-decoration.js')
).default
const renderTextDecoration = require(
  path.resolve(__dirname, '../src/utils/dom-render-text-decoration.js')
).default
const renderHr = require(
  path.resolve(__dirname, '../src/renderers/hr.js')
).default
const renderText = require(
  path.resolve(__dirname, '../src/renderers/text.js')
).default
const parseTransform = require(
  path.resolve(__dirname, '../src/utils/parse-transform.js')
).default

function font () {
  return {
    unitsPerEm: 1000,
    tables: {
      hhea: { ascender: 800, descender: -200 },
      os2: { yStrikeoutPosition: 300, yStrikeoutSize: 50 },
      post: { underlinePosition: -100, underlineThickness: 50 }
    },
    getAdvanceWidth: () => 10,
    getPath: () => ({ toPathData: () => 'M0 0L1 1' })
  }
}

module.exports = async function () {
  installDOM()

  const skew = parseTransform('matrix(1, 0, 0.5, 1, 0, 0)')
  assert.equal(
    skew.toSVGTransform({ origin: [10, 20] }),
    'matrix(1,0,0.5,1,-10,0)'
  )
  assert.equal(skew.matrix.c, 0.5)

  const matrix3d = parseTransform(
    'matrix3d(1, 0, 0, 0, 0.5, 1, 0, 0, 0, 0, 1, 0, 7, 8, 0, 1)'
  )
  assert.equal(matrix3d.matrix.c, 0.5)
  assert.equal(matrix3d.matrix.e, 7)
  assert.equal(matrix3d.matrix.f, 8)
  assert.throws(
    () => parseTransform(
      'matrix3d(1, 0, 0, 0.1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    ),
    /Unsupported 3D CSS transform/
  )

  const hrRenderer = renderHr({ debug: false, fonts: [] })
  const defaultHr = await hrRenderer({}, {
    x: 10,
    y: 5,
    width: 100,
    height: 2,
    style: style({
      'background-color': 'rgba(0, 0, 0, 0)',
      'background-image': 'none',
      'border-bottom-color': 'rgb(128, 128, 128)',
      'border-bottom-style': 'inset',
      'border-bottom-width': '1px',
      'border-left-color': 'rgb(128, 128, 128)',
      'border-left-style': 'inset',
      'border-left-width': '1px',
      'border-radius': '0px',
      'border-right-color': 'rgb(128, 128, 128)',
      'border-right-style': 'inset',
      'border-right-width': '1px',
      'border-top-color': 'rgb(128, 128, 128)',
      'border-top-style': 'inset',
      'border-top-width': '1px',
      'box-shadow': 'none'
    })
  })

  assert.equal(defaultHr.nodeName, 'g')
  assert.equal(defaultHr.children.length, 4)
  assert.deepEqual(
    defaultHr.children.map(child => child.nodeName),
    ['line', 'line', 'line', 'line']
  )
  assert.equal(defaultHr.children[0].attributes.stroke, 'rgb(96, 96, 96)')
  assert.equal(defaultHr.children[1].attributes.stroke, 'rgb(160, 160, 160)')
  assert.equal(defaultHr.children[2].attributes.stroke, 'rgb(160, 160, 160)')
  assert.equal(defaultHr.children[3].attributes.stroke, 'rgb(96, 96, 96)')
  assert.equal(defaultHr.children[1].attributes.x1, '109.5')
  assert.equal(defaultHr.children[1].attributes.x2, '109.5')

  const groovedHr = await hrRenderer({}, {
    x: 0,
    y: 0,
    width: 80,
    height: 8,
    style: style({
      'background-color': 'rgba(0, 0, 0, 0)',
      'background-image': 'none',
      'border-bottom-style': 'none',
      'border-left-style': 'none',
      'border-radius': '0px',
      'border-right-style': 'none',
      'border-top-color': 'rgb(128, 128, 128)',
      'border-top-style': 'groove',
      'border-top-width': '8px',
      'box-shadow': 'none'
    })
  })
  assert.equal(groovedHr.children.length, 2)
  assert.equal(groovedHr.children[0].attributes.stroke, 'rgb(96, 96, 96)')
  assert.equal(groovedHr.children[1].attributes.stroke, 'rgb(160, 160, 160)')

  const filledHr = await hrRenderer({}, {
    x: 0,
    y: 0,
    width: 80,
    height: 4,
    style: style({
      'background-color': 'rgb(255, 0, 0)',
      'background-image': 'none',
      'border-bottom-style': 'none',
      'border-left-style': 'none',
      'border-radius': '0px',
      'border-right-style': 'none',
      'border-top-style': 'none',
      'box-shadow': 'none'
    })
  })

  assert.equal(filledHr.children.length, 1)
  assert.equal(filledHr.children[0].nodeName, 'rect')
  assert.equal(filledHr.children[0].attributes.fill, 'rgb(255, 0, 0)')

  const opentype = font()
  const textRenderer = renderText({
    debug: false,
    fonts: [{ family: 'Ahem', opentype }]
  })
  const text = await textRenderer('Test', {
    x: 10,
    y: 20,
    width: 80,
    height: 20,
    style: style({
      color: 'rgb(0, 0, 0)',
      'font-family': 'Ahem',
      'font-size': '20px',
      'font-style': 'normal',
      'font-weight': '400',
      'letter-spacing': 'normal'
    })
  }, {})
  assert.equal(text.children.length, 1)
  assert.equal(text.children[0].nodeName, 'path')

  const decoration = renderTextDecoration({
    x: 10,
    width: 80,
    baseline: 36,
    fontSize: 20,
    font: opentype,
    color: 'rgb(0, 0, 0)',
    decorations: [{
      lines: ['underline', 'line-through'],
      color: 'rgb(255, 0, 0)',
      style: 'solid',
      thickness: '2px',
      underlineOffset: '3px'
    }]
  })
  assert.equal(decoration.children.length, 2)
  assert.equal(decoration.children[0].attributes.stroke, 'rgb(255, 0, 0)')
  assert.equal(decoration.children[0].attributes['stroke-width'], '2')
  assert.equal(decoration.children[0].attributes.y1, '41')
  assert.equal(decoration.children[1].attributes.y1, '30')

  const wavy = renderTextDecoration({
    x: 0,
    width: 20,
    baseline: 16,
    fontSize: 20,
    font: opentype,
    color: 'rgb(0, 0, 0)',
    decorations: [{
      lines: ['underline'],
      color: 'currentcolor',
      style: 'wavy',
      thickness: '1px',
      underlineOffset: 'auto'
    }]
  })
  assert.equal(wavy.children[0].nodeName, 'path')
  assert.match(wavy.children[0].attributes.d, / Q /)

  const ownDecoration = getTextDecoration(style({
    display: 'inline',
    'text-decoration-color': 'rgb(255, 0, 0)',
    'text-decoration-line': 'underline',
    'text-decoration-style': 'solid',
    'text-decoration-thickness': 'auto',
    'text-underline-offset': 'auto'
  }))
  assert.deepEqual(ownDecoration, {
    lines: ['underline'],
    color: 'rgb(255, 0, 0)',
    style: 'solid',
    thickness: 'auto',
    underlineOffset: 'auto'
  })
  assert.equal(getTextDecoration(style({
    display: 'contents',
    'text-decoration-line': 'underline'
  })), undefined)
}
