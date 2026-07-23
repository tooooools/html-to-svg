/* eslint-disable n/no-deprecated-api */

const babel = require('@babel/core')
const fs = require('fs')
const path = require('path')
const presetEnv = require('@babel/preset-env')

const sourceRoot = path.resolve(__dirname, '../src') + path.sep
const loadJavaScript = require.extensions['.js']

require.extensions['.js'] = function (module, filename) {
  if (!filename.startsWith(sourceRoot)) {
    return loadJavaScript(module, filename)
  }

  const source = fs.readFileSync(filename, 'utf8')
  const transformed = babel.transformSync(source, {
    babelrc: false,
    configFile: false,
    filename,
    presets: [[presetEnv, {
      modules: 'commonjs',
      targets: { node: 'current' }
    }]],
    sourceMaps: 'inline'
  })

  module._compile(transformed.code, filename)
}
