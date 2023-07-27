# html-to-svg

Render in the browser an HTML element to SVG with outlined fonts, leveraging the [Range API](https://developer.mozilla.org/en-US/docs/Web/API/Range) for text layout computations. 

This is a web-to-print oriented project, but will work as well for various SVG generation.

## Supported

- `<svg>`
- `<img>`
- `<canvas>`

## Not supported

- Native and local fonts
- CSS `transform: rotate()`
- CSS `transform: skew()`

## Usage

```js
const render = new HtmlToSvg(document.querySelector('main'), {
  debug: false,
  ignore: '', // CSS selector
  fonts: [
    { family: 'Ahem', url: '/fonts/ahem.ttf' },
    { family: 'Styrene', url: '/fonts/styrenea-regular.otf' },
    { family: 'Styrene', url: '/fonts/styrenea-regularitalic.otf', style: 'italic' }
  ]
})

await render.preload()
const svg = await render.compute()

document.body.appendChild(svg)
download(svg.outerHTML)
```

## Readings

- [_Deep dive CSS: font metrics, line-height and vertical-align_, Vincent De Oliveira](https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)
- [_Detecting Rendered Line Breaks In A Text Node In JavaScript_, Ben Nadel](https://www.bennadel.com/blog/4310-detecting-rendered-line-breaks-in-a-text-node-in-javascript.htm)
- [_CSS Inline Layout Module Level 3_](https://www.w3.org/TR/css-inline-3/#baseline-intro)

## Contributing

Support for various CSS properties and HTML element will be implemented based on personal usage. Feel free to create a fork and create a pull request to fix bugs and implement new features.

## Credits 

- [Opentype.js](https://github.com/opentypejs/opentype.js)
- [Ahem](https://www.w3.org/Style/CSS/Test/Fonts/Ahem/)

## License

[MIT.](https://tldrlegal.com/license/mit-license)
