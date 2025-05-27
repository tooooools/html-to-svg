(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('opentype.js'), require('uid'), require('transformation-matrix'), require('gradient-parser')) :
  typeof define === 'function' && define.amd ? define(['opentype.js', 'uid', 'transformation-matrix', 'gradient-parser'], factory) :
  (global = global || self, global.HtmlToSvg = factory(global.Opentype, global.uid, global.transformationMatrix, global.gradientParser));
})(this, (function (Opentype, uid, Transform, gradientParser) {
  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return n;
  }

  var Opentype__default = /*#__PURE__*/_interopDefaultLegacy(Opentype);
  var Transform__namespace = /*#__PURE__*/_interopNamespace(Transform);

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
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _createForOfIteratorHelperLoose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _settle$3(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact$3) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle$3.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle$3.bind(null, pact, state), _settle$3.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      var observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  var walk = function walk(element, callback, _temp2, depth, index) {
    var _ref = _temp2 === void 0 ? {} : _temp2,
      _ref$sort = _ref.sort,
      sort = _ref$sort === void 0 ? function () {
        return 1;
      } : _ref$sort;
    if (depth === void 0) {
      depth = 0;
    }
    if (index === void 0) {
      index = 0;
    }
    try {
      return Promise.resolve(callback(element, depth, index)).then(function () {
        var children = Array.from(element.children).sort(sort);
        var _temp = _forTo$3(children, function (index) {
          return Promise.resolve(walk(children[index], callback, {
            sort: sort
          }, depth + 1, index)).then(function () {});
        });
        if (_temp && _temp.then) return _temp.then(function () {});
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const _Pact$3 = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      const result = new _Pact();
      const state = this.s;
      if (state) {
        const callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle$3(result, 1, callback(this.v));
          } catch (e) {
            _settle$3(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          const value = _this.v;
          if (_this.s & 1) {
            _settle$3(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle$3(result, 1, onRejected(value));
          } else {
            _settle$3(result, 2, value);
          }
        } catch (e) {
          _settle$3(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _isSettledPact$3(thenable) {
    return thenable instanceof _Pact$3 && thenable.s & 1;
  }
  function _forTo$3(array, body, check) {
    var i = -1,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (++i < array.length && (!check || !check())) {
          result = body(i);
          if (result && result.then) {
            if (_isSettledPact$3(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle$3.bind(null, pact = new _Pact$3(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle$3(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle$3(pact || (pact = new _Pact$3()), 2, e);
      }
    }
    _cycle();
    return pact;
  }

  var getZIndex = (function (el) {
    var zindex = window.getComputedStyle(el).getPropertyValue('z-index');
    return zindex === 'auto' ? 0 : parseInt(zindex != null ? zindex : 0);
  });

  /* global DocumentFragment */

  // Return Range.clientRects with their corresponding DocumentFragment
  function getClientRects (node, text) {
    if (text === void 0) {
      text = node.innerText || node.textContent;
    }
    var range = document.createRange();
    var rects = [];
    for (var i = 0; i < node.length; i++) {
      var _rects$index;
      range.setStart(node, 0);
      range.setEnd(node, i + 1);
      var clientRects = range.getClientRects();
      var index = clientRects.length - 1;
      rects[index] = (_rects$index = rects[index]) != null ? _rects$index : {
        text: ''
      };
      rects[index].rect = clientRects[index];
      rects[index].text += text.charAt(i);
    }
    return rects.map(function (rect) {
      rect.fragment = new DocumentFragment();
      rect.fragment.textContent = rect.text;
      return rect;
    });
  }

  function getTextFragments (element) {
    if (!element) return;
    if (!element.innerText) return;
    if (!element.childNodes.length) return;
    var fragments = [];
    for (var _iterator = _createForOfIteratorHelperLoose(element.childNodes), _step; !(_step = _iterator()).done;) {
      var node = _step.value;
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
    var matrix = Transform__namespace.fromString(value);
    var _Transform$decomposeT = Transform__namespace.decomposeTSR(matrix),
      translate = _Transform$decomposeT.translate,
      scale = _Transform$decomposeT.scale,
      rotation = _Transform$decomposeT.rotation;
    return {
      raw: value,
      translate: translate,
      scale: scale,
      rotation: rotation,
      toSVGTransform: function toSVGTransform(_temp) {
        var _translate$tx, _translate$ty, _scale$sx, _ref2, _scale$sy, _rotation$angle;
        var _ref = _temp === void 0 ? {} : _temp,
          _ref$x = _ref.x,
          x = _ref$x === void 0 ? 0 : _ref$x,
          _ref$y = _ref.y,
          y = _ref$y === void 0 ? 0 : _ref$y,
          _ref$origin = _ref.origin,
          origin = _ref$origin === void 0 ? [0, 0] : _ref$origin;
        var cx = x + origin[0];
        var cy = y + origin[1];
        return Transform__namespace.toString(Transform__namespace.compose(Transform__namespace.translate((_translate$tx = translate == null ? void 0 : translate.tx) != null ? _translate$tx : 0, (_translate$ty = translate == null ? void 0 : translate.ty) != null ? _translate$ty : 0), Transform__namespace.scale((_scale$sx = scale == null ? void 0 : scale.sx) != null ? _scale$sx : 1, (_ref2 = (_scale$sy = scale == null ? void 0 : scale.sy) != null ? _scale$sy : scale == null ? void 0 : scale.sx) != null ? _ref2 : 1, cx, cy), Transform__namespace.rotate((_rotation$angle = rotation == null ? void 0 : rotation.angle) != null ? _rotation$angle : 0, cx, cy)));
      }
    };
  }

  var lastOf = (function (arr) {
    return arr[arr.length - 1];
  });

  function $ (name, props, parent, children) {
    if (props === void 0) {
      props = {};
    }
    if (children === void 0) {
      children = [];
    }
    var NS = 'http://www.w3.org/2000/svg';
    var element = document.createElementNS(NS, name);
    if (name === 'svg') element.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', NS);
    for (var key in props) {
      if (props[key] === null || props[key] === undefined) continue;
      element.setAttribute(key, props[key]);
    }
    if (parent) parent.appendChild(element);
    for (var _iterator = _createForOfIteratorHelperLoose((_children = children) != null ? _children : []), _step; !(_step = _iterator()).done;) {
      var _children;
      var child = _step.value;
      element.appendChild(child);
    }
    return element;
  }

  var canvas = (function (_ref) {
    return function (element, _ref2) {
      var x = _ref2.x,
        y = _ref2.y,
        width = _ref2.width,
        height = _ref2.height;
      try {
        return Promise.resolve($('image', {
          x: x,
          y: y,
          width: width,
          height: height,
          href: element.toDataURL('image/png')
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    };
  });

  var kebabToCamel = function kebabToCamel(s) {
    return s.replace(/-./g, function (x) {
      return x[1].toUpperCase();
    });
  };
  function isTransparent(color) {
    if (!color || color === 'none' || color === 'transparent') return true;
    if (color.startsWith('rgba')) {
      var rgba = color.match(/[\d.]+/g);
      if (rgba[3] === '0') return true;
    }
    return false;
  }
  function parseBorders(s) {
    var borders = null;
    for (var _i = 0, _arr = ['top', 'right', 'bottom', 'left']; _i < _arr.length; _i++) {
      var _borders;
      var dir = _arr[_i];
      var color = s.getPropertyValue("border-" + dir + "-color");
      var width = parseInt(s.getPropertyValue("border-" + dir + "-width"));
      var style = s.getPropertyValue("border-" + dir + "-style");

      // Skip invisible
      if (isTransparent(color)) continue;
      if (!width || isNaN(width)) continue;
      if (style === 'none' || style === 'hidden') continue;
      (_borders = borders) != null ? _borders : borders = {};
      borders[dir] = {
        color: color,
        width: width,
        style: style
      };
    }
    return borders;
  }
  var DivRenderer = (function (_ref) {
    return function (element, _ref2) {
      var x = _ref2.x,
        y = _ref2.y,
        width = _ref2.width,
        height = _ref2.height,
        style = _ref2.style,
        defs = _ref2.defs;
      try {
        var _style$getPropertyVal, _style$getPropertyVal2, _parseInt;
        if (!width || !height) return Promise.resolve();
        var backgroundColor = style.getPropertyValue('background-color');
        var backgroundImage = (_style$getPropertyVal = style.getPropertyValue('background-image')) != null ? _style$getPropertyVal : 'none';
        var boxShadow = (_style$getPropertyVal2 = style.getPropertyValue('box-shadow')) != null ? _style$getPropertyVal2 : 'none';
        var borderRadius = (_parseInt = parseInt(style.getPropertyValue('border-radius'))) != null ? _parseInt : null;
        var borders = parseBorders(style);

        // Skip visually empty blocks
        if (isTransparent(backgroundColor) && isTransparent(backgroundImage) && !borders) return Promise.resolve();

        // Render initial rect
        var g = $('g');
        var rect = $('rect', {
          x: x,
          y: y,
          width: width,
          height: height,
          fill: backgroundColor,
          rx: borderRadius
        }, g);

        // Render background-image
        if (!isTransparent(backgroundImage)) {
          var _parseGradient$, _parseGradient;
          // TODO handle multiple gradients
          var _ref3 = (_parseGradient$ = (_parseGradient = gradientParser.parse(backgroundImage)) == null ? void 0 : _parseGradient[0]) != null ? _parseGradient$ : {},
            colorStops = _ref3.colorStops,
            orientation = _ref3.orientation,
            type = _ref3.type;

          // TODO handle repeating gradients type, SEE https://github.com/rafaelcaricio/gradient-parser?tab=readme-ov-file#ast
          var gradient = $(kebabToCamel(type), {
            id: 'gradient_' + uid.uid(),
            gradientUnits: 'objectBoundingBox',
            // Allow specifying rotation center in %
            gradientTransform: orientation ? function () {
              switch (orientation.type) {
                case 'angular':
                  return "rotate(" + (270 + parseFloat(orientation.value)) + ", 0.5, 0.5)";
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
            }() : 'rotate(90, 0.5, 0.5)'
          }, defs);

          // Add color stops
          for (var index = 0; index < colorStops.length; index++) {
            var colorStop = colorStops[index];
            var stop = $('stop', {
              offset: colorStop.length
              // TODO handle colorStop.length.type other than '%'
              ? +colorStop.length.value / 100 : index / (colorStops.length - 1),
              'stop-color': colorStop.type + "(" + colorStop.value + ")"
            });
            gradient.appendChild(stop);
          }
          rect.setAttribute('fill', "url(#" + gradient.id + ")");
        }

        // Render box shadow
        if (boxShadow !== 'none') {
          var filter = $('filter', {
            id: 'filter_' + uid.uid()
          }, defs);
          // This assumes browser consistency of the CSSStyleDeclaration.getPropertyValue returned string
          var REGEX_SHADOW_DECLARATION = /rgba?\(([\d.]{1,3}(,\s)?){3,4}\)\s(-?(\d+)px\s?){4}/g;
          var REGEX_SHADOW_DECLARATION_PARSER = /(rgba?\((?:[\d.]{1,3}(?:,\s)?){3,4}\))\s(-?[\d.]+)px\s(-?[\d.]+)px\s(-?[\d.]+)px\s(-?[\d.]+)px/;
          for (var _iterator = _createForOfIteratorHelperLoose((_boxShadow$match = boxShadow.match(REGEX_SHADOW_DECLARATION)) != null ? _boxShadow$match : []), _step; !(_step = _iterator()).done;) {
            var _boxShadow$match;
            var shadowString = _step.value;
            var _shadowString$match = shadowString.match(REGEX_SHADOW_DECLARATION_PARSER),
              color = _shadowString$match[1],
              offx = _shadowString$match[2],
              offy = _shadowString$match[3],
              blur = _shadowString$match[4],
              spread = _shadowString$match[5];
            offx = parseInt(offx);
            offy = parseInt(offy);
            spread = parseInt(spread);
            filter.appendChild($('feGaussianBlur', {
              stdDeviation: blur / 2
            }));
            var shadow = $('rect', {
              x: x + offx - spread,
              y: y + offy - spread,
              width: width + spread * 2,
              height: height + spread * 2,
              fill: color,
              rx: borderRadius,
              filter: "url(#" + filter.id + ")"
            });
            g.prepend(shadow);
          }
        }

        // Render border
        if (!borderRadius) {
          var _loop = function _loop() {
            var _Object$entries$_i = _Object$entries[_i2],
              dir = _Object$entries$_i[0],
              border = _Object$entries$_i[1];
            var geom = {};
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
            }, function () {
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
            }()), g);
          };
          for (var _i2 = 0, _Object$entries = Object.entries(borders != null ? borders : {}); _i2 < _Object$entries.length; _i2++) {
            _loop();
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
        return Promise.resolve(g);
      } catch (e) {
        return Promise.reject(e);
      }
    };
  });

  var image = (function (_ref) {
    return function (element, _ref2) {
      var x = _ref2.x,
        y = _ref2.y,
        width = _ref2.width,
        height = _ref2.height;
      try {
        if (!width || !height) return Promise.resolve();
        if (!element.src) return Promise.resolve();
        return Promise.resolve($('image', {
          x: x,
          y: y,
          width: width,
          height: height,
          href: element.src
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    };
  });

  var _iteratorSymbol$2 = typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
  function _settle$2(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact$2) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle$2.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle$2.bind(null, pact, state), _settle$2.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      var observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  var _Pact$2 = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      var result = new _Pact();
      var state = this.s;
      if (state) {
        var callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle$2(result, 1, callback(this.v));
          } catch (e) {
            _settle$2(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          var value = _this.v;
          if (_this.s & 1) {
            _settle$2(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle$2(result, 1, onRejected(value));
          } else {
            _settle$2(result, 2, value);
          }
        } catch (e) {
          _settle$2(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _isSettledPact$2(thenable) {
    return thenable instanceof _Pact$2 && thenable.s & 1;
  }
  function _forTo$2(array, body, check) {
    var i = -1,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (++i < array.length && (!check || !check())) {
          result = body(i);
          if (result && result.then) {
            if (_isSettledPact$2(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle$2.bind(null, pact = new _Pact$2(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle$2(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle$2(pact || (pact = new _Pact$2()), 2, e);
      }
    }
    _cycle();
    return pact;
  }
  var SpanRenderer = function SpanRenderer(_ref) {
    var debug = _ref.debug,
      fonts = _ref.fonts;
    return function (element, _ref3, options) {
      var x = _ref3.x,
        y = _ref3.y,
        width = _ref3.width,
        height = _ref3.height,
        style = _ref3.style,
        viewBox = _ref3.viewBox;
      try {
        var _temp3 = function _temp3() {
          var _getTextFragments;
          // Render every text fragment using the div renderer (background etc)
          var renderDiv = DivRenderer({
            debug: debug,
            fonts: fonts
          });
          var _temp = _forOf$2((_getTextFragments = getTextFragments(element)) != null ? _getTextFragments : [], function (_ref2) {
            var rect = _ref2.rect;
            return Promise.resolve(renderDiv(element, {
              x: rect.x - viewBox.x,
              y: rect.y - viewBox.y,
              width: rect.width,
              height: rect.height,
              style: style,
              viewBox: viewBox
            }, options)).then(function (rendered) {
              if (rendered) g.appendChild(rendered);
            });
          });
          return _temp && _temp.then ? _temp.then(function () {
            return g;
          }) : g;
        };
        var g = $('g', null);

        // Render every child node as a span
        var renderSpan = SpanRenderer({
          debug: debug,
          fonts: fonts
        });
        var _temp2 = _forOf$2(element.childNodes, function (node) {
          var _appendChild = g.appendChild;
          return Promise.resolve(renderSpan(node, {
            x: x,
            y: y,
            width: width,
            height: height,
            style: style,
            viewBox: viewBox
          }, options)).then(function (_renderSpan) {
            _appendChild.call(g, _renderSpan);
          });
        });
        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2));
      } catch (e) {
        return Promise.reject(e);
      }
    };
  };
  function _forOf$2(target, body, check) {
    if (typeof target[_iteratorSymbol$2] === "function") {
      var iterator = target[_iteratorSymbol$2](),
        step,
        pact,
        reject;
      function _cycle(result) {
        try {
          while (!(step = iterator.next()).done && (!check || !check())) {
            result = body(step.value);
            if (result && result.then) {
              if (_isSettledPact$2(result)) {
                result = result.v;
              } else {
                result.then(_cycle, reject || (reject = _settle$2.bind(null, pact = new _Pact$2(), 2)));
                return;
              }
            }
          }
          if (pact) {
            _settle$2(pact, 1, result);
          } else {
            pact = result;
          }
        } catch (e) {
          _settle$2(pact || (pact = new _Pact$2()), 2, e);
        }
      }
      _cycle();
      if (iterator.return) {
        var _fixup = function (value) {
          try {
            if (!step.done) {
              iterator.return();
            }
          } catch (e) {}
          return value;
        };
        if (pact && pact.then) {
          return pact.then(_fixup, function (e) {
            throw _fixup(e);
          });
        }
        _fixup();
      }
      return pact;
    }
    // No support for Symbol.iterator
    if (!("length" in target)) {
      throw new TypeError("Object is not iterable");
    }
    // Handle live collections properly
    var values = [];
    for (var i = 0; i < target.length; i++) {
      values.push(target[i]);
    }
    return _forTo$2(values, function (i) {
      return body(values[i]);
    }, check);
  }

  /* global FileReader, XMLSerializer, btoa, XMLHttpRequest */
  const _iteratorSymbol$1 = typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
  function _settle$1(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact$1) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle$1.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle$1.bind(null, pact, state), _settle$1.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      var observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  var _Pact$1 = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      var result = new _Pact();
      var state = this.s;
      if (state) {
        var callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle$1(result, 1, callback(this.v));
          } catch (e) {
            _settle$1(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          var value = _this.v;
          if (_this.s & 1) {
            _settle$1(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle$1(result, 1, onRejected(value));
          } else {
            _settle$1(result, 2, value);
          }
        } catch (e) {
          _settle$1(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _isSettledPact$1(thenable) {
    return thenable instanceof _Pact$1 && thenable.s & 1;
  }
  function _forTo$1(array, body, check) {
    var i = -1,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (++i < array.length && (!check || !check())) {
          result = body(i);
          if (result && result.then) {
            if (_isSettledPact$1(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle$1.bind(null, pact = new _Pact$1(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle$1(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle$1(pact || (pact = new _Pact$1()), 2, e);
      }
    }
    _cycle();
    return pact;
  }
  function _forOf$1(target, body, check) {
    if (typeof target[_iteratorSymbol$1] === "function") {
      var _cycle = function _cycle(result) {
        try {
          while (!(step = iterator.next()).done && (!check || !check())) {
            result = body(step.value);
            if (result && result.then) {
              if (_isSettledPact$1(result)) {
                result = result.v;
              } else {
                result.then(_cycle, reject || (reject = _settle$1.bind(null, pact = new _Pact$1(), 2)));
                return;
              }
            }
          }
          if (pact) {
            _settle$1(pact, 1, result);
          } else {
            pact = result;
          }
        } catch (e) {
          _settle$1(pact || (pact = new _Pact$1()), 2, e);
        }
      };
      var iterator = target[_iteratorSymbol$1](),
        step,
        pact,
        reject;
      _cycle();
      if (iterator["return"]) {
        var _fixup = function _fixup(value) {
          try {
            if (!step.done) {
              iterator["return"]();
            }
          } catch (e) {}
          return value;
        };
        if (pact && pact.then) {
          return pact.then(_fixup, function (e) {
            throw _fixup(e);
          });
        }
        _fixup();
      }
      return pact;
    }
    // No support for Symbol.iterator
    if (!("length" in target)) {
      throw new TypeError("Object is not iterable");
    }
    // Handle live collections properly
    var values = [];
    for (var i = 0; i < target.length; i++) {
      values.push(target[i]);
    }
    return _forTo$1(values, function (i) {
      return body(values[i]);
    }, check);
  }
  var svg = (function (_ref) {
    var cache = _ref.cache;
    return function (element, _ref2, _temp5) {
      var x = _ref2.x,
        y = _ref2.y,
        width = _ref2.width,
        height = _ref2.height;
      var _ref3 = _temp5 === void 0 ? {} : _temp5,
        _ref3$rasterizeNested = _ref3.rasterizeNestedSVG,
        rasterizeNestedSVG = _ref3$rasterizeNested === void 0 ? true : _ref3$rasterizeNested;
      try {
        var _temp4 = function _temp4() {
          return rasterizeNestedSVG ? $('image', {
            x: x,
            y: y,
            width: width,
            height: height,
            href: 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(element))
          }) : function () {
            var svg = $('svg', {
              x: x,
              y: y,
              width: width,
              height: height,
              viewbox: "0 0 " + width + " " + height
            });
            svg.innerHTML = element.innerHTML;
            return svg;
          }();
        };
        var _temp3 = _forOf$1(element.querySelectorAll('image[href]'), function (image) {
          function _temp2() {
            image.setAttribute('href', cache.get(src));
          }
          var src = image.getAttribute('href');
          var _temp = function () {
            if (!cache.has(src)) {
              // Fetch blob from image src
              return Promise.resolve(new Promise(function (resolve) {
                var request = new XMLHttpRequest();
                request.open('GET', src, true);
                request.responseType = 'blob';
                request.onload = function () {
                  return resolve(request.response);
                };
                request.send();
              })).then(function (blob) {
                // Convert blob to dataURL using the FileReader API
                return Promise.resolve(new Promise(function (resolve) {
                  var reader = new FileReader();
                  reader.onload = function (e) {
                    return resolve(e.target.result);
                  };
                  reader.readAsDataURL(blob);
                })).then(function (dataURL) {
                  // Cache dataURL
                  cache.set(src, dataURL);
                });
              });
            }
          }();
          return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
        });
        // Convert all image to dataURL to maximizime compatibility
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3));
      } catch (e) {
        return Promise.reject(e);
      }
    };
  });

  var matchFont = function matchFont(s) {
    return function (_temp) {
      var _s$getPropertyValue, _s$getPropertyValue2, _s$getPropertyValue3;
      var _ref = _temp === void 0 ? {} : _temp,
        family = _ref.family,
        _ref$style = _ref.style,
        style = _ref$style === void 0 ? 'normal' : _ref$style,
        _ref$weight = _ref.weight,
        weight = _ref$weight === void 0 ? '400' : _ref$weight;
      return family === ((_s$getPropertyValue = s.getPropertyValue('font-family')) != null ? _s$getPropertyValue : '').replace(/['"]/g, '') && style === ((_s$getPropertyValue2 = s.getPropertyValue('font-style')) != null ? _s$getPropertyValue2 : 'normal') && weight === ((_s$getPropertyValue3 = s.getPropertyValue('font-weight')) != null ? _s$getPropertyValue3 : '400');
    };
  };
  var text = (function (_ref2) {
    var debug = _ref2.debug,
      fonts = _ref2.fonts;
    return function (string, _ref3, _ref4) {
      var x = _ref3.x,
        y = _ref3.y,
        width = _ref3.width,
        height = _ref3.height,
        style = _ref3.style;
      var _ref4$splitText = _ref4.splitText,
        splitText = _ref4$splitText === void 0 ? false : _ref4$splitText;
      try {
        var line = function line(title, v, _temp2) {
          var _ref5 = _temp2 === void 0 ? {} : _temp2,
            _ref5$orientation = _ref5.orientation,
            orientation = _ref5$orientation === void 0 ? 'horizontal' : _ref5$orientation,
            _ref5$stroke = _ref5.stroke,
            stroke = _ref5$stroke === void 0 ? 'black' : _ref5$stroke;
          return debug && $('line', {
            title: title,
            'data-value': v,
            x1: orientation === 'horizontal' ? x : x + v,
            x2: orientation === 'horizontal' ? x + width : x + v,
            y1: orientation === 'horizontal' ? y + v : y,
            y2: orientation === 'horizontal' ? y + v : y + height,
            stroke: stroke,
            "class": 'debug'
          }, g);
        };
        if (!string) return Promise.resolve();
        var g = $('g', {
          "class": 'text-fragment'
        });

        // Find font
        var font = fonts.find(matchFont(style));
        if (!font) throw new Error("Cannot find font '" + style.getPropertyValue('font-family') + " " + style.getPropertyValue('font-style') + " " + style.getPropertyValue('font-weight') + "'");

        // Extract font metrics
        var unitsPerEm = font.opentype.unitsPerEm;
        var ascender = font.opentype.tables.hhea.ascender;
        var descender = font.opentype.tables.hhea.descender;

        // Extract CSS props
        var letterSpacing = style.getPropertyValue('letter-spacing');
        var fontSize = parseFloat(style.getPropertyValue('font-size'));

        // Compute metrics
        var lineBox = (ascender - descender) / unitsPerEm;
        var leading = fontSize * lineBox - Math.abs(descender / unitsPerEm) * fontSize;

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
        if (letterSpacing !== 'normal' || splitText) {
          var ls = letterSpacing === 'normal' ? 0 : parseFloat(letterSpacing);

          // Render letter by letter in case of non-default letter-spacing or explicit split
          for (var _iterator = _createForOfIteratorHelperLoose(string), _step; !(_step = _iterator()).done;) {
            var c = _step.value;
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
        return Promise.resolve(g);
      } catch (e) {
        return Promise.reject(e);
      }
    };
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

  const _iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
  function _settle(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      var observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  var _Pact = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      var result = new _Pact();
      var state = this.s;
      if (state) {
        var callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle(result, 1, callback(this.v));
          } catch (e) {
            _settle(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          var value = _this.v;
          if (_this.s & 1) {
            _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle(result, 1, onRejected(value));
          } else {
            _settle(result, 2, value);
          }
        } catch (e) {
          _settle(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _isSettledPact(thenable) {
    return thenable instanceof _Pact && thenable.s & 1;
  }
  function _forTo(array, body, check) {
    var i = -1,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (++i < array.length && (!check || !check())) {
          result = body(i);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    return pact;
  }
  function _forOf(target, body, check) {
    if (typeof target[_iteratorSymbol] === "function") {
      var _cycle = function _cycle(result) {
        try {
          while (!(step = iterator.next()).done && (!check || !check())) {
            result = body(step.value);
            if (result && result.then) {
              if (_isSettledPact(result)) {
                result = result.v;
              } else {
                result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
                return;
              }
            }
          }
          if (pact) {
            _settle(pact, 1, result);
          } else {
            pact = result;
          }
        } catch (e) {
          _settle(pact || (pact = new _Pact()), 2, e);
        }
      };
      var iterator = target[_iteratorSymbol](),
        step,
        pact,
        reject;
      _cycle();
      if (iterator["return"]) {
        var _fixup = function _fixup(value) {
          try {
            if (!step.done) {
              iterator["return"]();
            }
          } catch (e) {}
          return value;
        };
        if (pact && pact.then) {
          return pact.then(_fixup, function (e) {
            throw _fixup(e);
          });
        }
        _fixup();
      }
      return pact;
    }
    // No support for Symbol.iterator
    if (!("length" in target)) {
      throw new TypeError("Object is not iterable");
    }
    // Handle live collections properly
    var values = [];
    for (var i = 0; i < target.length; i++) {
      values.push(target[i]);
    }
    return _forTo(values, function (i) {
      return body(values[i]);
    }, check);
  }
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  function index (_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
      _ref$debug = _ref.debug,
      debug = _ref$debug === void 0 ? false : _ref$debug,
      _ref$ignore = _ref.ignore,
      ignore = _ref$ignore === void 0 ? '' : _ref$ignore,
      _ref$fonts = _ref.fonts,
      fonts = _ref$fonts === void 0 ? [] : _ref$fonts;
    var cache = new Map();
    var detransformed = new Map();

    // Init curried renderers
    var renderers = {};
    for (var k in RENDERERS) {
      renderers[k] = RENDERERS[k]({
        debug: debug,
        fonts: fonts,
        cache: cache
      });
    }

    // Restore all removed transformation if any
    var cleanup = function cleanup() {
      for (var _iterator = _createForOfIteratorHelperLoose(detransformed), _step; !(_step = _iterator()).done;) {
        var _step$value = _step.value,
          element = _step$value[0],
          transform = _step$value[1];
        element.style.transform = transform;
        detransformed["delete"](element);
      }
    };
    return {
      get cache() {
        return cache;
      },
      cleanup: cleanup,
      // Preload all fonts before resolving
      preload: function preload() {
        try {
          var _temp2 = _forOf(fonts, function (font) {
            if (font.opentype) return;
            return Promise.resolve(new Promise(function (resolve) {
              Opentype__default["default"].load(font.url, function (error, font) {
                if (error) throw error;
                resolve(font);
              });
            })).then(function (_Promise) {
              font.opentype = _Promise;
            });
          });
          return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      },
      // Clear cache and delete all resources
      destroy: function destroy() {
        cache.clear();
        cleanup();
        for (var _iterator2 = _createForOfIteratorHelperLoose(fonts), _step2; !(_step2 = _iterator2()).done;) {
          var font = _step2.value;
          delete font.opentype;
        }
      },
      // Render the HTML container as a shadow SVG
      render: function render(root, options, transform) {
        if (options === void 0) {
          options = {};
        }
        try {
          cleanup();
          var viewBox = root.getBoundingClientRect();

          // Create the SVG container
          var svg = $('svg', {
            viewBox: "0 0 " + viewBox.width + " " + viewBox.height,
            width: viewBox.width,
            height: viewBox.height,
            preserveAspectRatio: 'none'
          });
          var defs = $('defs', null, svg);

          // Set context to root SVG.
          // Context will change during walk push/pop
          var Context = function () {
            var stack = [svg];
            var pop = function pop() {
              return stack.length > 0 && stack.pop();
            };
            var push = function push() {
              return stack.push($('g', null, lastOf(stack)));
            };
            return {
              pop: pop,
              push: push,
              get current() {
                return lastOf(stack);
              },
              apply: function apply(depth) {
                var deltaDepth = depth - (stack.length - 1);
                for (var i = 0; i < -deltaDepth; i++) pop();
                for (var _i = 0; _i < deltaDepth; _i++) push();
              }
            };
          }();

          // Render every children
          return Promise.resolve(walk(root, function (element, depth, index) {
            try {
              var _renderers$element$ta;
              if (ignore && element !== root && element.matches(ignore)) return Promise.resolve();
              Context.apply(depth);

              // Extract geometric and style data from element
              var style = window.getComputedStyle(element);
              var matrix = element !== root && parseTransform(style.getPropertyValue('transform'));
              var opacity = style.getPropertyValue('opacity');
              var mixBlendMode = style.getPropertyValue('mix-blend-mode');
              var clipPath = style.getPropertyValue('clip-path');
              var overflow = style.getPropertyValue('overflow');

              // Temporarily remove transformation to simplify coordinates calc
              if (matrix) {
                // WARNING this will cause issues with concurent renderings:
                // <renderer>#cleanup is called before to ensure purity
                detransformed.set(element, element.style.transform);
                element.style.transform = 'none';
              }
              var _element$getBoundingC = element.getBoundingClientRect(),
                x = _element$getBoundingC.x,
                y = _element$getBoundingC.y,
                width = _element$getBoundingC.width,
                height = _element$getBoundingC.height;

              // Create a new context
              if (+opacity !== 1 || matrix || mixBlendMode !== 'normal' || overflow === 'hidden' || clipPath !== 'none') Context.push();

              // Handle opacity
              if (+opacity !== 1) {
                Context.current.setAttribute('opacity', opacity);
              }

              // Handle mix-blend-mode
              if (mixBlendMode !== 'normal') {
                console.log(mixBlendMode);
                Context.current.style.mixBlendMode = mixBlendMode;
              }

              // Handle transformation
              if (matrix) {
                Context.current.setAttribute('transform', matrix.toSVGTransform({
                  x: x - viewBox.x,
                  y: y - viewBox.y,
                  origin: style.getPropertyValue('transform-origin').split(' ').map(function (v) {
                    return parseFloat(v);
                  })
                }));
              }

              // Handle overflow: hidden
              if (overflow === 'hidden') {
                var _clipPath = $('clipPath', {
                  id: 'clip_' + uid.uid()
                }, defs, [$('rect', {
                  x: x - viewBox.x,
                  y: y - viewBox.y,
                  width: width,
                  height: height
                })]);
                Context.current.setAttribute('clip-path', "url(#" + _clipPath.id + ")");
              }

              // Handle CSS clip-path property
              if (clipPath !== 'none') {
                // WARNING: CSS clip-path implementation is not done yet on arnaudjuracek/svg-to-pdf
                Context.current.setAttribute('style', "clip-path: " + clipPath.replace(/"/g, "'"));
              }

              // Render element
              var render = (_renderers$element$ta = renderers[element.tagName]) != null ? _renderers$element$ta : renderers.div;
              return Promise.resolve(render(element, {
                x: x - viewBox.x,
                y: y - viewBox.y,
                width: width,
                height: height,
                style: style,
                viewBox: viewBox,
                defs: defs
              }, options)).then(function (rendered) {
                function _temp9() {
                  var _getTextFragments;
                  function _temp7() {
                    if (g.children.length) Context.current.appendChild(g);
                  }
                  if (rendered) Context.current.appendChild(rendered);

                  // Render text nodes inside the element
                  var g = $('g', {
                    "class": 'text'
                  });
                  var _temp6 = _forOf((_getTextFragments = getTextFragments(element)) != null ? _getTextFragments : [], function (_ref2) {
                    var rect = _ref2.rect,
                      fragment = _ref2.fragment;
                    var _temp5 = _catch(function () {
                      return Promise.resolve(renderers.text(fragment.textContent.trimEnd(), {
                        x: rect.x - viewBox.x,
                        y: rect.y - viewBox.y,
                        width: rect.width,
                        height: rect.height,
                        style: style
                      }, options)).then(function (text) {
                        function _temp4() {
                          if (text) g.appendChild(text);
                        }
                        var _temp3 = function () {
                          if (transform) return Promise.resolve(transform(element, text)).then(function (_transform2) {
                            text = _transform2;
                          });
                        }();
                        return _temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3);
                      });
                    }, function (error) {
                      // TODO[improve] error handling
                      console.warn(new Error("Rendering failed for the following text: '" + fragment.textContent + "'", {
                        cause: error
                      }));
                      console.warn(error);
                    });
                    if (_temp5 && _temp5.then) return _temp5.then(function () {});
                  });
                  return _temp6 && _temp6.then ? _temp6.then(_temp7) : _temp7(_temp6);
                }
                var _temp8 = function () {
                  if (transform) return Promise.resolve(transform(element, rendered)).then(function (_transform) {
                    rendered = _transform;
                  });
                }();
                return _temp8 && _temp8.then ? _temp8.then(_temp9) : _temp9(_temp8);
              });
            } catch (e) {
              return Promise.reject(e);
            }
          }, {
            sort: function sort(a, b) {
              var _a$zIndex, _b$zIndex;
              (_a$zIndex = a.zIndex) != null ? _a$zIndex : a.zIndex = getZIndex(a);
              (_b$zIndex = b.zIndex) != null ? _b$zIndex : b.zIndex = getZIndex(b);
              return a.zIndex - b.zIndex;
            }
          })).then(function () {
            cleanup();
            return svg;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    };
  }

  return index;

}));
//# sourceMappingURL=html-to-svg.umd.js.map
