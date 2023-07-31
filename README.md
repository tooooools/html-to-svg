# html-to-svg

Render in the browser an HTML element to SVG with vectorised fonts.  
This module uses the [Range API](https://developer.mozilla.org/en-US/docs/Web/API/Range) for robust and precise text layout computation.

## Features

### Supported elements

The renderer pipeline is structured such as every type of HTML element can have its own renderer, making contribution and testing much more simple.

#### [`renderers/div`](src/renderers/div.js)

Render HTML `<div>` with its background color and its border-radius.  
Also acts as the **fallback renderer for all HTML elements**.

#### [`renderers/text`](src/renderers/text.js)

Render [text node](https://developer.mozilla.org/en-US/docs/Web/API/Text), using computed style and loaded fonts (**will throw an error if no matching fonts declaration is found**).

All fonts are outlined using [Opentype.js](https://github.com/opentypejs/opentype.js).

#### [`renderers/image`](src/renderers/image.js)

Render HTML `<img>` as SVG `<image>` element.

#### [`renderers/canvas`](src/renderers/canvas.js)

Render a HTMLCanvas element as a base64 png in a SVG `<image>` element.

#### [`renderers/svg`](src/renderers/svg.js)

Render inline `<svg>` element as a base64 in a SVG `<image>` element.

### Roadmap

- Support for HTML `<hr>` element
- Support for CSS `text-decoration` property
- Support for CSS `background-image` property
- Support for CSS `border` property
- Support for CSS `opacity` property
- Support for CSS `z-index` property
- Support for CSS `transform: rotate()` property
- Support for CSS `transform: skew()` property

### Limitations

This project primarily aims at rendering printable SVG files, in which case font rendering is far more robust when outlining every texts.

[Opentype.js](https://github.com/opentypejs/opentype.js) does not support (yet) loading local fonts: as a result, **every font used in in the rendering process should be explicitly declared in the render constructor** (see [Usage](#usage) below).

At the time of writing, an an experimental [Local Font Access API](https://developer.chrome.com/en/articles/local-fonts/) is being tested, which could circumvent this issue. Contributions on implementing this API, or using native opt-in (or fallback) SVG `<text>` will be really appreciated.

## Usage

```js
const render = new HtmlToSvg(document.querySelector('main'), {
  debug: false,
  ignore: '.html-only, video', // CSS selector
  fonts: [
    { family: 'Roboto', url: '/fonts/roboto-regular.otf' },
    { family: 'Roboto', url: '/fonts/roboto-bold.otf', weight: '600' },
    { family: 'Roboto', url: '/fonts/roboto-regular-italic.otf', style: 'italic' }
  ]
})

await render.preload()
const svg = await render.compute()

document.body.appendChild(svg)
download(svg.outerHTML)
```

## Contributing

Support for various CSS properties and HTML element will be implemented based on personal usage. 

Any contribution are much appreciated: if you have a suggestion that would make this better, please fork the repo and create a pull request.

### Implementing a new renderer

To implement a new renderer for a specifc HTML element, simply export the renderer in the [`src/renderers.js`](src/renderers.js), with the export name matching a [HTMLElement.tagName](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName).

The renderer is a curried function with the following signature, returning either a nullish value or a valid SVG HTMLElement:

###### `renderers/example.js`
```js
import $ from '../utils/dom-render-svg'

export default ({ debug, fonts }) => async (element, props) => {
  // The coordinates system origin is the top-left corner of the rendered container
  const { x, y, width, height, style } = props

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('x', x)
  rect.setAttribute('y', y)
  rect.setAttribute('width', width)
  rect.setAttribute('height', height)
  return rect

  // or with utils/dom-render-svg:
  return $('circle', { x, y, width, height })
}

```

## Development

```sh
$ yarn build
$ yarn test    # build and live-serve test/
$ yarn version # build module, example, and publish to npm
```

## Readings

- [_Deep dive CSS: font metrics, line-height and vertical-align_, Vincent De Oliveira](https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)
- [_Detecting Rendered Line Breaks In A Text Node In JavaScript_, Ben Nadel](https://www.bennadel.com/blog/4310-detecting-rendered-line-breaks-in-a-text-node-in-javascript.htm)
- [_CSS Inline Layout Module Level 3_](https://www.w3.org/TR/css-inline-3/#baseline-intro)

## Credits 

- [Opentype.js](https://github.com/opentypejs/opentype.js)
- [Ahem](https://www.w3.org/Style/CSS/Test/Fonts/Ahem/)

## License

[MIT.](https://tldrlegal.com/license/mit-license)
