!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("opentype.js")):"function"==typeof define&&define.amd?define(["opentype.js"],e):(t||self).HtmlToSvg=e(t.Opentype)}(this,function(t){function e(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var n=/*#__PURE__*/e(t);function r(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function o(t,e){var n="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(n)return(n=n.call(t)).next.bind(n);if(Array.isArray(t)||(n=function(t,e){if(t){if("string"==typeof t)return r(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var o=0;return function(){return o>=t.length?{done:!0}:{done:!1,value:t[o++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i="undefined"!=typeof Symbol?Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")):"@@iterator";function u(t,e,n){if(!t.s){if(n instanceof a){if(!n.s)return void(n.o=u.bind(null,t,e));1&e&&(e=n.s),n=n.v}if(n&&n.then)return void n.then(u.bind(null,t,e),u.bind(null,t,2));t.s=e,t.v=n;var r=t.o;r&&r(t)}}var a=/*#__PURE__*/function(){function t(){}return t.prototype.then=function(e,n){var r=new t,o=this.s;if(o){var i=1&o?e:n;if(i){try{u(r,1,i(this.v))}catch(t){u(r,2,t)}return r}return this}return this.o=function(t){try{var o=t.v;1&t.s?u(r,1,e?e(o):o):n?u(r,1,n(o)):u(r,2,o)}catch(t){u(r,2,t)}},r},t}();function f(t){return t instanceof a&&1&t.s}var l=function t(e,n){try{return Promise.resolve(n(e)).then(function(r){if(r){var o=function(t,e,n){if("function"==typeof t[i]){var r,o,l,c=t[i]();if(function t(n){try{for(;!(r=c.next()).done;)if((n=e(r.value))&&n.then){if(!f(n))return void n.then(t,l||(l=u.bind(null,o=new a,2)));n=n.v}o?u(o,1,n):o=n}catch(t){u(o||(o=new a),2,t)}}(),c.return){var h=function(t){try{r.done||c.return()}catch(t){}return t};if(o&&o.then)return o.then(h,function(t){throw h(t)});h()}return o}if(!("length"in t))throw new TypeError("Object is not iterable");for(var s=[],d=0;d<t.length;d++)s.push(t[d]);return function(t,e,n){var r,o,i=-1;return function n(l){try{for(;++i<t.length;)if((l=e(i))&&l.then){if(!f(l))return void l.then(n,o||(o=u.bind(null,r=new a,2)));l=l.v}r?u(r,1,l):r=l}catch(t){u(r||(r=new a),2,t)}}(),r}(s,function(t){return e(s[t])})}(e.children,function(e){return Promise.resolve(t(e,n)).then(function(){})});return o&&o.then?o.then(function(){}):void 0}})}catch(t){return Promise.reject(t)}};function c(t,e,n){void 0===e&&(e={});var r="http://www.w3.org/2000/svg",o=document.createElementNS(r,t);for(var i in"svg"===t&&o.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns",r),e)null!=e[i]&&o.setAttribute(i,e[i]);return n&&n.appendChild(o),o}var h=function(t){return function(t,e){var n=e.x,r=e.y,o=e.width,i=e.height,u=e.style;try{if(!o||!i)return Promise.resolve();var a=u.getPropertyValue("background-color");return a&&"none"!==a&&"transparent"!==a?a.startsWith("rgba")&&"0"===a.match(/[\d.]+/g)[3]?Promise.resolve():Promise.resolve(c("rect",{x:n,y:r,width:o,height:i,fill:a,rx:parseInt(u.getPropertyValue("border-radius"))||null})):Promise.resolve()}catch(t){return Promise.reject(t)}}},s=function(t){return function(t,e){var n=e.x,r=e.y,o=e.width,i=e.height;try{return Promise.resolve(c("image",{x:n,y:r,width:o,height:i,href:"data:image/svg+xml;base64,"+btoa((new XMLSerializer).serializeToString(t))}))}catch(t){return Promise.reject(t)}}},d={__proto__:null,div:h,text:function(t){var e=t.debug,n=t.fonts;return function(t,r){var i,u=r.x,a=r.y,f=r.width,l=r.height,h=r.style;try{var s=function(t,n,r){var o=void 0===r?{}:r,i=o.orientation,h=void 0===i?"horizontal":i,s=o.stroke;return e&&c("line",{title:t,"data-value":n,x1:"horizontal"===h?u:u+n,x2:"horizontal"===h?u+f:u+n,y1:"horizontal"===h?a+n:a,y2:"horizontal"===h?a+n:a+l,stroke:void 0===s?"black":s,class:"debug"},d)};if(!t)return Promise.resolve();var d=c("g"),v=n.find((i=h,function(t){var e,n,r,o=void 0===t?{}:t,u=o.style,a=void 0===u?"normal":u,f=o.weight,l=void 0===f?"400":f;return o.family===(null!=(e=i.getPropertyValue("font-family"))?e:"").replace(/['"]/g,"")&&a===(null!=(n=i.getPropertyValue("font-style"))?n:"normal")&&l===(null!=(r=i.getPropertyValue("font-weight"))?r:"400")}));if(!v)throw new Error("Cannot find font '"+h.getPropertyValue("font-family")+" "+h.getPropertyValue("font-style")+" "+h.getPropertyValue("font-weight")+"'");var y=v.opentype.unitsPerEm,g=v.opentype.tables.hhea.ascender,p=v.opentype.tables.hhea.descender,m=h.getPropertyValue("letter-spacing"),w=parseFloat(h.getPropertyValue("font-size")),b=w*((g-p)/y)-Math.abs(p/y)*w;if(s("start",0,{orientation:"vertical",stroke:"red"}),s("end",f,{orientation:"vertical",stroke:"red"}),s("leading",b,{stroke:"#4b96ff"}),"normal"!==m)for(var P,x=o(t);!(P=x()).done;){var S=P.value;c("path",{d:v.opentype.getPath(S,u,a+b,w).toPathData(3),fill:h.getPropertyValue("color")},d),u+=v.opentype.getAdvanceWidth(S,w)+parseFloat(m)}else c("path",{d:v.opentype.getPath(t,u,a+b,w,{features:{liga:!0,rlig:!0}}).toPathData(3),fill:h.getPropertyValue("color")},d);return Promise.resolve(d)}catch(t){return Promise.reject(t)}}},svg:s,DIV:h,CANVAS:function(t){return function(t,e){var n=e.x,r=e.y,o=e.width,i=e.height;try{return Promise.resolve(c("image",{x:n,y:r,width:o,height:i,href:t.toDataURL("image/png")}))}catch(t){return Promise.reject(t)}}},IMG:function(t){return function(t,e){var n=e.x,r=e.y,o=e.width,i=e.height;try{return o&&i&&t.src?Promise.resolve(c("image",{x:n,y:r,width:o,height:i,href:t.src})):Promise.resolve()}catch(t){return Promise.reject(t)}}},SVG:s};const v="undefined"!=typeof Symbol?Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")):"@@iterator";function y(t,e,n){if(!t.s){if(n instanceof g){if(!n.s)return void(n.o=y.bind(null,t,e));1&e&&(e=n.s),n=n.v}if(n&&n.then)return void n.then(y.bind(null,t,e),y.bind(null,t,2));t.s=e,t.v=n;var r=t.o;r&&r(t)}}var g=/*#__PURE__*/function(){function t(){}return t.prototype.then=function(e,n){var r=new t,o=this.s;if(o){var i=1&o?e:n;if(i){try{y(r,1,i(this.v))}catch(t){y(r,2,t)}return r}return this}return this.o=function(t){try{var o=t.v;1&t.s?y(r,1,e?e(o):o):n?y(r,1,n(o)):y(r,2,o)}catch(t){y(r,2,t)}},r},t}();function p(t){return t instanceof g&&1&t.s}function m(t,e,n){if("function"==typeof t[v]){var r,o,i,u=t[v]();if(function t(a){try{for(;!((r=u.next()).done||n&&n());)if((a=e(r.value))&&a.then){if(!p(a))return void a.then(t,i||(i=y.bind(null,o=new g,2)));a=a.v}o?y(o,1,a):o=a}catch(t){y(o||(o=new g),2,t)}}(),u.return){var a=function(t){try{r.done||u.return()}catch(t){}return t};if(o&&o.then)return o.then(a,function(t){throw a(t)});a()}return o}if(!("length"in t))throw new TypeError("Object is not iterable");for(var f=[],l=0;l<t.length;l++)f.push(t[l]);return function(t,e,n){var r,o,i=-1;return function u(a){try{for(;++i<t.length&&(!n||!n());)if((a=e(i))&&a.then){if(!p(a))return void a.then(u,o||(o=y.bind(null,r=new g,2)));a=a.v}r?y(r,1,a):r=a}catch(t){y(r||(r=new g),2,t)}}(),r}(f,function(t){return e(f[t])},n)}return function(t,e){void 0===t&&(t=document.body);var r=void 0===e?{}:e,i=r.debug,u=void 0!==i&&i,a=r.ignore,f=void 0===a?"":a,h=r.fonts,s=void 0===h?[]:h,v={};for(var y in d)v[y]=d[y]({debug:u,fonts:s});return{preload:function(){try{var t=m(s,function(t){if(!t.opentype)return Promise.resolve(new Promise(function(e){n.default.load(t.url,function(t,n){if(t)throw t;e(n)})})).then(function(e){t.opentype=e})});return Promise.resolve(t&&t.then?t.then(function(){}):void 0)}catch(t){return Promise.reject(t)}},flush:function(){for(var t,e=o(s);!(t=e()).done;)delete t.value.opentype},compute:function(){try{var e=t.getBoundingClientRect(),n=c("svg",{viewBox:"0 0 "+e.width+" "+e.height,width:e.width,height:e.height,preserveAspectRatio:"none"});return Promise.resolve(l(t,function(r){try{var o;if(f&&r!==t&&r.matches(f))return Promise.resolve();var i=window.getComputedStyle(r),u=r.getBoundingClientRect(),a=null!=(o=v[r.tagName])?o:v.div;return Promise.resolve(a(r,{x:u.x-e.x,y:u.y-e.y,width:u.width,height:u.height,style:i})).then(function(t){t&&n.appendChild(t);var o=function(){if(r.innerText)return m(r.childNodes,function(t){if(t.nodeType===Node.TEXT_NODE&&t.textContent.length){if(!/^\s/.test(t.textContent))return m(function(t,e){void 0===e&&(e=t.innerText||t.textContent);for(var n=document.createRange(),r=[],o=0;o<t.length;o++){var i;n.setStart(t,0),n.setEnd(t,o+1);var u=n.getClientRects(),a=u.length-1;r[a]=null!=(i=r[a])?i:{text:""},r[a].rect=u[a],r[a].text+=e.charAt(o)}return r.map(function(t){return t.fragment=new DocumentFragment,t.fragment.textContent=t.text,t})}(t),function(t){var r=t.rect,o=t.fragment,u=function(t,u){try{var a=Promise.resolve(v.text(o.textContent.trimEnd(),{x:r.x-e.x,y:r.y-e.y,width:r.width,height:r.height,style:i})).then(function(t){t&&n.appendChild(t)})}catch(t){return u(t)}return a&&a.then?a.then(void 0,u):a}(0,function(t){console.warn(new Error("Rendering failed for the following text: '"+o.textContent+"'",{cause:t})),console.warn(t)});if(u&&u.then)return u.then(function(){})});t.splitText(1)}})}();return!o||!o.then||o.then(function(){return!0})})}catch(t){return Promise.reject(t)}})).then(function(){return n})}catch(t){return Promise.reject(t)}}}}});
//# sourceMappingURL=html-to-svg.umd.js.map
