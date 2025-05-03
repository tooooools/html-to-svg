import Opentype from 'opentype.js';
import { uid } from 'uid';
import * as Transform from 'transformation-matrix';
import { parse } from 'gradient-parser';

async function walk(element, callback, {
  sort = () => 1
} = {}, depth = 0, index = 0) {
  await callback(element, depth, index);
  const children = Array.from(element.children).sort(sort);
  for (let _index = 0; _index < children.length; _index++) {
    await walk(children[_index], callback, {
      sort
    }, depth + 1, _index);
  }
}

var getZIndex = (el => {
  const zindex = window.getComputedStyle(el).getPropertyValue('z-index');
  return zindex === 'auto' ? 0 : parseInt(zindex != null ? zindex : 0);
});

/* global DocumentFragment */

// Return Range.clientRects with their corresponding DocumentFragment
function getClientRects (node, text = node.innerText || node.textContent) {
  const range = document.createRange();
  const rects = [];
  for (let i = 0; i < node.length; i++) {
    var _rects$index;
    range.setStart(node, 0);
    range.setEnd(node, i + 1);
    const clientRects = range.getClientRects();
    const index = clientRects.length - 1;
    rects[index] = (_rects$index = rects[index]) != null ? _rects$index : {
      text: ''
    };
    rects[index].rect = clientRects[index];
    rects[index].text += text.charAt(i);
  }
  return rects.map(rect => {
    rect.fragment = new DocumentFragment();
    rect.fragment.textContent = rect.text;
    return rect;
  });
}

/* global Node */
function getTextFragments (element) {
  if (!element) return;
  if (!element.innerText) return;
  if (!element.childNodes.length) return;
  let fragments = [];
  for (const node of element.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    if (!node.textContent.length) continue;

    // Text interface does not provide a .innerText method, which would be
    // more appropriate than textContent as it skips non-rendered whitespaces
    // Splitting white-space leading Text trick the browser to recompute
    // the layout itself, dealing with implicit space between adjacent nodes
    if (/^\s/.test(node.textContent)) node.splitText(1);
    fragments = fragments.concat(getClientRects(node));
  }
  return fragments;
}

function parseTransform (value) {
  if (!value || value === 'none' || value === '') return null;
  const matrix = Transform.fromString(value);
  const {
    translate,
    scale,
    rotation
  } = Transform.decomposeTSR(matrix);
  return {
    raw: value,
    translate,
    scale,
    rotation,
    toSVGTransform: ({
      x: _x = 0,
      y: _y = 0,
      origin: _origin = [0, 0]
    } = {}) => {
      var _translate$tx, _translate$ty, _scale$sx, _ref, _scale$sy, _rotation$angle;
      const cx = _x + _origin[0];
      const cy = _y + _origin[1];
      return Transform.toString(Transform.compose(Transform.translate((_translate$tx = translate == null ? void 0 : translate.tx) != null ? _translate$tx : 0, (_translate$ty = translate == null ? void 0 : translate.ty) != null ? _translate$ty : 0), Transform.scale((_scale$sx = scale == null ? void 0 : scale.sx) != null ? _scale$sx : 1, (_ref = (_scale$sy = scale == null ? void 0 : scale.sy) != null ? _scale$sy : scale == null ? void 0 : scale.sx) != null ? _ref : 1, cx, cy), Transform.rotate((_rotation$angle = rotation == null ? void 0 : rotation.angle) != null ? _rotation$angle : 0, cx, cy)));
    }
  };
}

var lastOf = (arr => arr[arr.length - 1]);

function $ (name, props = {}, parent, children = []) {
  const NS = 'http://www.w3.org/2000/svg';
  const element = document.createElementNS(NS, name);
  if (name === 'svg') element.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', NS);
  for (const key in props) {
    if (props[key] === null || props[key] === undefined) continue;
    element.setAttribute(key, props[key]);
  }
  if (parent) parent.appendChild(element);
  for (const child of children != null ? children : []) element.appendChild(child);
  return element;
}

var canvas = (({
  debug,
  fonts
}) => async (element, {
  x,
  y,
  width,
  height,
  style
}) => $('image', {
  x,
  y,
  width,
  height,
  href: element.toDataURL('image/png')
}));

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

const kebabToCamel = s => s.replace(/-./g, x => x[1].toUpperCase());
function isTransparent(color) {
  if (!color || color === 'none' || color === 'transparent') return true;
  if (color.startsWith('rgba')) {
    const rgba = color.match(/[\d.]+/g);
    if (rgba[3] === '0') return true;
  }
  return false;
}
function parseBorders(s) {
  let borders = null;
  for (const dir of ['top', 'right', 'bottom', 'left']) {
    var _borders;
    const color = s.getPropertyValue(`border-${dir}-color`);
    const width = parseInt(s.getPropertyValue(`border-${dir}-width`));
    const style = s.getPropertyValue(`border-${dir}-style`);

    // Skip invisible
    if (isTransparent(color)) continue;
    if (!width || isNaN(width)) continue;
    if (style === 'none' || style === 'hidden') continue;
    (_borders = borders) != null ? _borders : borders = {};
    borders[dir] = {
      color,
      width,
      style
    };
  }
  return borders;
}
var DivRenderer = (({
  debug,
  fonts
}) => async (element, {
  x,
  y,
  width,
  height,
  style,
  defs
}) => {
  var _style$getPropertyVal, _style$getPropertyVal2, _parseInt;
  if (!width || !height) return;
  const backgroundColor = style.getPropertyValue('background-color');
  const backgroundImage = (_style$getPropertyVal = style.getPropertyValue('background-image')) != null ? _style$getPropertyVal : 'none';
  const boxShadow = (_style$getPropertyVal2 = style.getPropertyValue('box-shadow')) != null ? _style$getPropertyVal2 : 'none';
  const borderRadius = (_parseInt = parseInt(style.getPropertyValue('border-radius'))) != null ? _parseInt : null;
  const borders = parseBorders(style);

  // Skip visually empty blocks
  if (isTransparent(backgroundColor) && isTransparent(backgroundImage) && !borders) return;

  // Render initial rect
  const g = $('g');
  const rect = $('rect', {
    x,
    y,
    width,
    height,
    fill: backgroundColor,
    rx: borderRadius
  }, g);

  // Render background-image
  if (!isTransparent(backgroundImage)) {
    var _parseGradient$, _parseGradient;
    // TODO handle multiple gradients
    const {
      colorStops,
      orientation,
      type
    } = (_parseGradient$ = (_parseGradient = parse(backgroundImage)) == null ? void 0 : _parseGradient[0]) != null ? _parseGradient$ : {};

    // TODO handle repeating gradients type, SEE https://github.com/rafaelcaricio/gradient-parser?tab=readme-ov-file#ast
    const gradient = $(kebabToCamel(type), {
      id: 'gradient_' + uid(),
      gradientUnits: 'objectBoundingBox',
      // Allow specifying rotation center in %
      gradientTransform: orientation ? (() => {
        switch (orientation.type) {
          case 'angular':
            return `rotate(${270 + parseFloat(orientation.value)}, 0.5, 0.5)`;
          case 'directional':
            {
              switch (orientation.value) {
                case 'top':
                  return 'rotate(270, 0.5, 0.5)';
                case 'right':
                  return null;
                case 'bottom':
                  return 'rotate(90, 0.5, 0.5)';
                case 'left':
                  return 'rotate(180, 0.5, 0.5)';
              }
            }
        }
      })() : 'rotate(90, 0.5, 0.5)'
    }, defs);

    // Add color stops
    for (let index = 0; index < colorStops.length; index++) {
      const colorStop = colorStops[index];
      const stop = $('stop', {
        offset: colorStop.length
        // TODO handle colorStop.length.type other than '%'
        ? +colorStop.length.value / 100 : index / (colorStops.length - 1),
        'stop-color': `${colorStop.type}(${colorStop.value})`
      });
      gradient.appendChild(stop);
    }
    rect.setAttribute('fill', `url(#${gradient.id})`);
  }

  // Render box shadow
  if (boxShadow !== 'none') {
    const filter = $('filter', {
      id: 'filter_' + uid()
    }, defs);
    // This assumes browser consistency of the CSSStyleDeclaration.getPropertyValue returned string
    const REGEX_SHADOW_DECLARATION = /rgba?\(([\d.]{1,3}(,\s)?){3,4}\)\s(-?(\d+)px\s?){4}/g;
    const REGEX_SHADOW_DECLARATION_PARSER = /(rgba?\((?:[\d.]{1,3}(?:,\s)?){3,4}\))\s(-?[\d.]+)px\s(-?[\d.]+)px\s(-?[\d.]+)px\s(-?[\d.]+)px/;
    for (const shadowString of (_boxShadow$match = boxShadow.match(REGEX_SHADOW_DECLARATION)) != null ? _boxShadow$match : []) {
      var _boxShadow$match;
      let [, color, offx, offy, blur, spread] = shadowString.match(REGEX_SHADOW_DECLARATION_PARSER);
      offx = parseInt(offx);
      offy = parseInt(offy);
      spread = parseInt(spread);
      filter.appendChild($('feGaussianBlur', {
        stdDeviation: blur / 2
      }));
      const shadow = $('rect', {
        x: x + offx - spread,
        y: y + offy - spread,
        width: width + spread * 2,
        height: height + spread * 2,
        fill: color,
        rx: borderRadius,
        filter: `url(#${filter.id})`
      });
      g.prepend(shadow);
    }
  }

  // Render border
  if (!borderRadius) {
    for (const [dir, border] of Object.entries(borders != null ? borders : {})) {
      const geom = {};
      switch (dir) {
        case 'top':
          geom.x1 = x;
          geom.x2 = x + width;
          geom.y1 = geom.y2 = y + parseInt(border.width) / 2;
          break;
        case 'right':
          geom.x1 = geom.x2 = x + width - parseInt(border.width) / 2;
          geom.y1 = y;
          geom.y2 = y + height;
          break;
        case 'bottom':
          geom.x1 = x;
          geom.x2 = x + width;
          geom.y1 = geom.y2 = y + height - parseInt(border.width) / 2;
          break;
        case 'left':
          geom.x1 = geom.x2 = x + parseInt(border.width) / 2;
          geom.y1 = y;
          geom.y2 = y + height;
          break;
      }
      $('line', _extends({}, geom, {
        stroke: border.color,
        'stroke-width': border.width
      }, (() => {
        switch (border.style) {
          case 'dotted':
            return {
              'stroke-dasharray': [0, border.width * 2].join(' '),
              'stroke-dashoffset': 1,
              'stroke-linejoin': 'round',
              'stroke-linecap': 'round'
            };
          case 'dashed':
            return {
              // https://developer.mozilla.org/en-US/docs/Web/CSS/border-style#dashed
              'stroke-dasharray': [border.width * 2, 4].join(' ')
            };
          default:
            return {};
        }
      })()), g);
    }
  } else if (borders != null && borders.top) {
    // Handle border-radius by drawing the whole border as a standard stroke
    // TODO handle border-radius for specific border-dir.
    // For now, we use borders.top as a placeholder for all borders
    rect.setAttribute('stroke', borders.top.color);
    rect.setAttribute('stroke-width', borders.top.width);

    // Draw border from center
    rect.setAttribute('rx', borderRadius - borders.top.width / 2);
    rect.setAttribute('x', x + borders.top.width / 2);
    rect.setAttribute('y', y + borders.top.width / 2);
    rect.setAttribute('width', width - borders.top.width);
    rect.setAttribute('height', height - borders.top.width);
  }
  return g;
});

var image = (({
  debug,
  fonts
}) => async (element, {
  x,
  y,
  width,
  height,
  style
}) => {
  if (!width || !height) return;
  if (!element.src) return;
  return $('image', {
    x,
    y,
    width,
    height,
    href: element.src
  });
});

const SpanRenderer = ({
  debug,
  fonts
}) => async (element, {
  x,
  y,
  width,
  height,
  style,
  viewBox
}, options) => {
  const g = $('g', null);

  // Render every child node as a span
  const renderSpan = SpanRenderer({
    debug,
    fonts
  });
  for (const node of element.childNodes) {
    g.appendChild(await renderSpan(node, {
      x,
      y,
      width,
      height,
      style,
      viewBox
    }, options));
  }

  // Render every text fragment using the div renderer (background etc)
  const renderDiv = DivRenderer({
    debug,
    fonts
  });
  for (const {
    rect
  } of (_getTextFragments = getTextFragments(element)) != null ? _getTextFragments : []) {
    var _getTextFragments;
    const rendered = await renderDiv(element, {
      x: rect.x - viewBox.x,
      y: rect.y - viewBox.y,
      width: rect.width,
      height: rect.height,
      style,
      viewBox
    }, options);
    if (rendered) g.appendChild(rendered);
  }
  return g;
};

/* global FileReader, XMLSerializer, btoa, XMLHttpRequest */
var svg = (({
  cache
}) => async (element, {
  x,
  y,
  width,
  height,
  style
}, {
  rasterizeNestedSVG: _rasterizeNestedSVG = true
} = {}) => {
  // Convert all image to dataURL to maximizime compatibility
  for (const image of element.querySelectorAll('image[href]')) {
    const src = image.getAttribute('href');
    if (!cache.has(src)) {
      // Fetch blob from image src
      const blob = await new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open('GET', src, true);
        request.responseType = 'blob';
        request.onload = () => resolve(request.response);
        request.send();
      });

      // Convert blob to dataURL using the FileReader API
      const dataURL = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(blob);
      });

      // Cache dataURL
      cache.set(src, dataURL);
    }
    image.setAttribute('href', cache.get(src));
  }
  return _rasterizeNestedSVG ? $('image', {
    x,
    y,
    width,
    height,
    href: 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(element))
  }) : (() => {
    const svg = $('svg', {
      x,
      y,
      width,
      height,
      viewbox: `0 0 ${width} ${height}`
    });
    svg.innerHTML = element.innerHTML;
    return svg;
  })();
});

// TODO text-decoration
const matchFont = s => ({
  family,
  style: _style = 'normal',
  weight: _weight = '400'
} = {}) => {
  var _s$getPropertyValue, _s$getPropertyValue2, _s$getPropertyValue3;
  return family === ((_s$getPropertyValue = s.getPropertyValue('font-family')) != null ? _s$getPropertyValue : '').replace(/['"]/g, '') && _style === ((_s$getPropertyValue2 = s.getPropertyValue('font-style')) != null ? _s$getPropertyValue2 : 'normal') && _weight === ((_s$getPropertyValue3 = s.getPropertyValue('font-weight')) != null ? _s$getPropertyValue3 : '400');
};
var text = (({
  debug,
  fonts
}) => async (string, {
  x,
  y,
  width,
  height,
  style
}, {
  splitText: _splitText = false
}) => {
  if (!string) return;
  const g = $('g', {
    class: 'text-fragment'
  });

  // Find font
  const font = fonts.find(matchFont(style));
  if (!font) throw new Error(`Cannot find font '${style.getPropertyValue('font-family')} ${style.getPropertyValue('font-style')} ${style.getPropertyValue('font-weight')}'`);

  // Extract font metrics
  const {
    unitsPerEm
  } = font.opentype;
  const ascender = font.opentype.tables.hhea.ascender;
  const descender = font.opentype.tables.hhea.descender;

  // Extract CSS props
  const letterSpacing = style.getPropertyValue('letter-spacing');
  const fontSize = parseFloat(style.getPropertyValue('font-size'));

  // Compute metrics
  const lineBox = (ascender - descender) / unitsPerEm;
  const leading = fontSize * lineBox - Math.abs(descender / unitsPerEm) * fontSize;

  // Render various metrics for debug
  line('start', 0, {
    orientation: 'vertical',
    stroke: 'red'
  });
  line('end', width, {
    orientation: 'vertical',
    stroke: 'red'
  });
  line('leading', leading, {
    stroke: '#4b96ff'
  });
  if (letterSpacing !== 'normal' || _splitText) {
    const ls = letterSpacing === 'normal' ? 0 : parseFloat(letterSpacing);

    // Render letter by letter in case of non-default letter-spacing or explicit split
    for (const c of string) {
      if (!c.match(/\s/)) {
        // Do not render spaces
        $('path', {
          d: font.opentype.getPath(c, x, y + leading, fontSize).toPathData(3),
          fill: style.getPropertyValue('color')
        }, g);
      }
      x += font.opentype.getAdvanceWidth(c, fontSize) + ls;
    }
  } else {
    // Render string
    $('path', {
      d: font.opentype.getPath(string, x, y + leading, fontSize, {
        features: {
          // TODO extract from CSS props
          liga: true,
          rlig: true
        }
      }).toPathData(3),
      fill: style.getPropertyValue('color')
    }, g);
  }
  return g;
  function line(title, v, {
    orientation = 'horizontal',
    stroke = 'black'
  } = {}) {
    return debug && $('line', {
      title,
      'data-value': v,
      x1: orientation === 'horizontal' ? x : x + v,
      x2: orientation === 'horizontal' ? x + width : x + v,
      y1: orientation === 'horizontal' ? y + v : y,
      y2: orientation === 'horizontal' ? y + v : y + height,
      stroke,
      class: 'debug'
    }, g);
  }
});

var RENDERERS = {
  __proto__: null,
  div: DivRenderer,
  text: text,
  svg: svg,
  DIV: DivRenderer,
  MARK: SpanRenderer,
  SPAN: SpanRenderer,
  CANVAS: canvas,
  IMG: image,
  SVG: svg
};

function index ({
  debug = false,
  ignore = '',
  fonts = []
} = {}) {
  const cache = new Map();
  const detransformed = new Map();

  // Init curried renderers
  const renderers = {};
  for (const k in RENDERERS) {
    renderers[k] = RENDERERS[k]({
      debug,
      fonts,
      cache
    });
  }

  // Restore all removed transformation if any
  const cleanup = () => {
    for (const [element, transform] of detransformed) {
      element.style.transform = transform;
      detransformed.delete(element);
    }
  };
  return {
    get cache() {
      return cache;
    },
    cleanup,
    // Preload all fonts before resolving
    preload: async function () {
      for (const font of fonts) {
        if (font.opentype) continue;
        font.opentype = await new Promise(resolve => {
          Opentype.load(font.url, (error, font) => {
            if (error) throw error;
            resolve(font);
          });
        });
      }
    },
    // Clear cache and delete all resources
    destroy: function () {
      cache.clear();
      cleanup();
      for (const font of fonts) delete font.opentype;
    },
    // Render the HTML container as a shadow SVG
    render: async function (root, options = {}, transform) {
      cleanup();
      const viewBox = root.getBoundingClientRect();

      // Create the SVG container
      const svg = $('svg', {
        viewBox: `0 0 ${viewBox.width} ${viewBox.height}`,
        width: viewBox.width,
        height: viewBox.height,
        preserveAspectRatio: 'none'
      });
      const defs = $('defs', null, svg);

      // Set context to root SVG.
      // Context will change during walk push/pop
      const Context = (() => {
        const stack = [svg];
        const pop = () => stack.length > 0 && stack.pop();
        const push = () => stack.push($('g', null, lastOf(stack)));
        return {
          pop,
          push,
          get current() {
            return lastOf(stack);
          },
          apply: depth => {
            const deltaDepth = depth - (stack.length - 1);
            for (let i = 0; i < -deltaDepth; i++) pop();
            for (let i = 0; i < deltaDepth; i++) push();
          }
        };
      })();

      // Render every children
      await walk(root, async (element, depth, index) => {
        var _renderers$element$ta;
        if (ignore && element !== root && element.matches(ignore)) return;
        Context.apply(depth);

        // Extract geometric and style data from element
        const style = window.getComputedStyle(element);
        const matrix = element !== root && parseTransform(style.getPropertyValue('transform'));
        const opacity = style.getPropertyValue('opacity');
        const clipPath = style.getPropertyValue('clip-path');
        const overflow = style.getPropertyValue('overflow');

        // Temporarily remove transformation to simplify coordinates calc
        if (matrix) {
          // WARNING this will cause issues with concurent renderings:
          // <renderer>#cleanup is called before to ensure purity
          detransformed.set(element, element.style.transform);
          element.style.transform = 'none';
        }
        const {
          x,
          y,
          width,
          height
        } = element.getBoundingClientRect();

        // Create a new context
        if (+opacity !== 1 || matrix || overflow === 'hidden' || clipPath !== 'none') Context.push();

        // Handle opacity
        if (+opacity !== 1) {
          Context.current.setAttribute('opacity', opacity);
        }

        // Handle transformation
        if (matrix) {
          Context.current.setAttribute('transform', matrix.toSVGTransform({
            x: x - viewBox.x,
            y: y - viewBox.y,
            origin: style.getPropertyValue('transform-origin').split(' ').map(v => parseFloat(v))
          }));
        }

        // Handle overflow: hidden
        if (overflow === 'hidden') {
          const _clipPath = $('clipPath', {
            id: 'clip_' + uid()
          }, defs, [$('rect', {
            x: x - viewBox.x,
            y: y - viewBox.y,
            width,
            height
          })]);
          Context.current.setAttribute('clip-path', `url(#${_clipPath.id})`);
        }

        // Handle CSS clip-path property
        if (clipPath !== 'none') {
          // WARNING: CSS clip-path implementation is not done yet on arnaudjuracek/svg-to-pdf
          Context.current.setAttribute('style', `clip-path: ${clipPath.replace(/"/g, "'")}`);
        }

        // Render element
        const render = (_renderers$element$ta = renderers[element.tagName]) != null ? _renderers$element$ta : renderers.div;
        let rendered = await render(element, {
          x: x - viewBox.x,
          y: y - viewBox.y,
          width,
          height,
          style,
          viewBox,
          defs
        }, options);
        if (transform) rendered = await transform(element, rendered);
        if (rendered) Context.current.appendChild(rendered);

        // Render text nodes inside the element
        const g = $('g', {
          class: 'text'
        });
        for (const {
          rect,
          fragment
        } of (_getTextFragments = getTextFragments(element)) != null ? _getTextFragments : []) {
          var _getTextFragments;
          try {
            let text = await renderers.text(fragment.textContent.trimEnd(), {
              x: rect.x - viewBox.x,
              y: rect.y - viewBox.y,
              width: rect.width,
              height: rect.height,
              style
            }, options);
            if (transform) text = await transform(element, text);
            if (text) g.appendChild(text);
          } catch (error) {
            // TODO[improve] error handling
            console.warn(new Error(`Rendering failed for the following text: '${fragment.textContent}'`, {
              cause: error
            }));
            console.warn(error);
          }
        }
        if (g.children.length) Context.current.appendChild(g);
      }, {
        sort: (a, b) => {
          var _a$zIndex, _b$zIndex;
          (_a$zIndex = a.zIndex) != null ? _a$zIndex : a.zIndex = getZIndex(a);
          (_b$zIndex = b.zIndex) != null ? _b$zIndex : b.zIndex = getZIndex(b);
          return a.zIndex - b.zIndex;
        }
      });
      cleanup();
      return svg;
    }
  };
}

export { index as default };
//# sourceMappingURL=html-to-svg.modern.mjs.map
