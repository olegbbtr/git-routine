(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var n, l$1, u$2, i$1, o$1, r$1, e$1, f$2, c$1, s$2, a$1, p$1 = {}, v$1 = [], y$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, d$1 = Array.isArray;
function w$1(n2, l2) {
  for (var u2 in l2) n2[u2] = l2[u2];
  return n2;
}
function g(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _(l2, u2, t2) {
  var i2, o2, r2, e2 = {};
  for (r2 in u2) "key" == r2 ? i2 = u2[r2] : "ref" == r2 ? o2 = u2[r2] : e2[r2] = u2[r2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (r2 in l2.defaultProps) void 0 === e2[r2] && (e2[r2] = l2.defaultProps[r2]);
  return m$1(l2, e2, i2, o2, null);
}
function m$1(n2, t2, i2, o2, r2) {
  var e2 = { type: n2, props: t2, key: i2, ref: o2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == r2 ? ++u$2 : r2, __i: -1, __u: 0 };
  return null == r2 && null != l$1.vnode && l$1.vnode(e2), e2;
}
function k$1(n2) {
  return n2.children;
}
function x(n2, l2) {
  this.props = n2, this.context = l2;
}
function S(n2, l2) {
  if (null == l2) return n2.__ ? S(n2.__, n2.__i + 1) : null;
  for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
  return "function" == typeof n2.type ? S(n2) : null;
}
function C$1(n2) {
  var l2, u2;
  if (null != (n2 = n2.__) && null != n2.__c) {
    for (n2.__e = n2.__c.base = null, l2 = 0; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) {
      n2.__e = n2.__c.base = u2.__e;
      break;
    }
    return C$1(n2);
  }
}
function M(n2) {
  (!n2.__d && (n2.__d = true) && i$1.push(n2) && !$.__r++ || o$1 != l$1.debounceRendering) && ((o$1 = l$1.debounceRendering) || r$1)($);
}
function $() {
  for (var n2, u2, t2, o2, r2, f2, c2, s2 = 1; i$1.length; ) i$1.length > s2 && i$1.sort(e$1), n2 = i$1.shift(), s2 = i$1.length, n2.__d && (t2 = void 0, o2 = void 0, r2 = (o2 = (u2 = n2).__v).__e, f2 = [], c2 = [], u2.__P && ((t2 = w$1({}, o2)).__v = o2.__v + 1, l$1.vnode && l$1.vnode(t2), O(u2.__P, t2, o2, u2.__n, u2.__P.namespaceURI, 32 & o2.__u ? [r2] : null, f2, null == r2 ? S(o2) : r2, !!(32 & o2.__u), c2), t2.__v = o2.__v, t2.__.__k[t2.__i] = t2, N(f2, t2, c2), o2.__e = o2.__ = null, t2.__e != r2 && C$1(t2)));
  $.__r = 0;
}
function I(n2, l2, u2, t2, i2, o2, r2, e2, f2, c2, s2) {
  var a2, h2, y2, d2, w2, g2, _2, m2 = t2 && t2.__k || v$1, b = l2.length;
  for (f2 = P(u2, l2, m2, f2, b), a2 = 0; a2 < b; a2++) null != (y2 = u2.__k[a2]) && (h2 = -1 == y2.__i ? p$1 : m2[y2.__i] || p$1, y2.__i = a2, g2 = O(n2, y2, h2, i2, o2, r2, e2, f2, c2, s2), d2 = y2.__e, y2.ref && h2.ref != y2.ref && (h2.ref && B$1(h2.ref, null, y2), s2.push(y2.ref, y2.__c || d2, y2)), null == w2 && null != d2 && (w2 = d2), (_2 = !!(4 & y2.__u)) || h2.__k === y2.__k ? f2 = A$1(y2, f2, n2, _2) : "function" == typeof y2.type && void 0 !== g2 ? f2 = g2 : d2 && (f2 = d2.nextSibling), y2.__u &= -7);
  return u2.__e = w2, f2;
}
function P(n2, l2, u2, t2, i2) {
  var o2, r2, e2, f2, c2, s2 = u2.length, a2 = s2, h2 = 0;
  for (n2.__k = new Array(i2), o2 = 0; o2 < i2; o2++) null != (r2 = l2[o2]) && "boolean" != typeof r2 && "function" != typeof r2 ? ("string" == typeof r2 || "number" == typeof r2 || "bigint" == typeof r2 || r2.constructor == String ? r2 = n2.__k[o2] = m$1(null, r2, null, null, null) : d$1(r2) ? r2 = n2.__k[o2] = m$1(k$1, { children: r2 }, null, null, null) : void 0 === r2.constructor && r2.__b > 0 ? r2 = n2.__k[o2] = m$1(r2.type, r2.props, r2.key, r2.ref ? r2.ref : null, r2.__v) : n2.__k[o2] = r2, f2 = o2 + h2, r2.__ = n2, r2.__b = n2.__b + 1, e2 = null, -1 != (c2 = r2.__i = L(r2, u2, f2, a2)) && (a2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > s2 ? h2-- : i2 < s2 && h2++), "function" != typeof r2.type && (r2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, r2.__u |= 4))) : n2.__k[o2] = null;
  if (a2) for (o2 = 0; o2 < s2; o2++) null != (e2 = u2[o2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = S(e2)), D$1(e2, e2));
  return t2;
}
function A$1(n2, l2, u2, t2) {
  var i2, o2;
  if ("function" == typeof n2.type) {
    for (i2 = n2.__k, o2 = 0; i2 && o2 < i2.length; o2++) i2[o2] && (i2[o2].__ = n2, l2 = A$1(i2[o2], l2, u2, t2));
    return l2;
  }
  n2.__e != l2 && (t2 && (l2 && n2.type && !l2.parentNode && (l2 = S(n2)), u2.insertBefore(n2.__e, l2 || null)), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 == l2.nodeType);
  return l2;
}
function L(n2, l2, u2, t2) {
  var i2, o2, r2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], s2 = null != c2 && 0 == (2 & c2.__u);
  if (null === c2 && null == e2 || s2 && e2 == c2.key && f2 == c2.type) return u2;
  if (t2 > (s2 ? 1 : 0)) {
    for (i2 = u2 - 1, o2 = u2 + 1; i2 >= 0 || o2 < l2.length; ) if (null != (c2 = l2[r2 = i2 >= 0 ? i2-- : o2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return r2;
  }
  return -1;
}
function T$1(n2, l2, u2) {
  "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || y$1.test(l2) ? u2 : u2 + "px";
}
function j$1(n2, l2, u2, t2, i2) {
  var o2, r2;
  n: if ("style" == l2) if ("string" == typeof u2) n2.style.cssText = u2;
  else {
    if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || T$1(n2.style, l2, "");
    if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || T$1(n2.style, l2, u2[l2]);
  }
  else if ("o" == l2[0] && "n" == l2[1]) o2 = l2 != (l2 = l2.replace(f$2, "$1")), r2 = l2.toLowerCase(), l2 = r2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? r2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + o2] = u2, u2 ? t2 ? u2.u = t2.u : (u2.u = c$1, n2.addEventListener(l2, o2 ? a$1 : s$2, o2)) : n2.removeEventListener(l2, o2 ? a$1 : s$2, o2);
  else {
    if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
      n2[l2] = null == u2 ? "" : u2;
      break n;
    } catch (n3) {
    }
    "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
  }
}
function F(n2) {
  return function(u2) {
    if (this.l) {
      var t2 = this.l[u2.type + n2];
      if (null == u2.t) u2.t = c$1++;
      else if (u2.t < t2.u) return;
      return t2(l$1.event ? l$1.event(u2) : u2);
    }
  };
}
function O(n2, u2, t2, i2, o2, r2, e2, f2, c2, s2) {
  var a2, h2, p2, v2, y2, _2, m2, b, S2, C2, M2, $2, P2, A2, H, L2, T2, j2 = u2.type;
  if (void 0 !== u2.constructor) return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), r2 = [f2 = u2.__e = t2.__e]), (a2 = l$1.__b) && a2(u2);
  n: if ("function" == typeof j2) try {
    if (b = u2.props, S2 = "prototype" in j2 && j2.prototype.render, C2 = (a2 = j2.contextType) && i2[a2.__c], M2 = a2 ? C2 ? C2.props.value : a2.__ : i2, t2.__c ? m2 = (h2 = u2.__c = t2.__c).__ = h2.__E : (S2 ? u2.__c = h2 = new j2(b, M2) : (u2.__c = h2 = new x(b, M2), h2.constructor = j2, h2.render = E), C2 && C2.sub(h2), h2.state || (h2.state = {}), h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), S2 && null == h2.__s && (h2.__s = h2.state), S2 && null != j2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = w$1({}, h2.__s)), w$1(h2.__s, j2.getDerivedStateFromProps(b, h2.__s))), v2 = h2.props, y2 = h2.state, h2.__v = u2, p2) S2 && null == j2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), S2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
    else {
      if (S2 && null == j2.getDerivedStateFromProps && b !== v2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(b, M2), u2.__v == t2.__v || !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(b, h2.__s, M2)) {
        for (u2.__v != t2.__v && (h2.props = b, h2.state = h2.__s, h2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
          n3 && (n3.__ = u2);
        }), $2 = 0; $2 < h2._sb.length; $2++) h2.__h.push(h2._sb[$2]);
        h2._sb = [], h2.__h.length && e2.push(h2);
        break n;
      }
      null != h2.componentWillUpdate && h2.componentWillUpdate(b, h2.__s, M2), S2 && null != h2.componentDidUpdate && h2.__h.push(function() {
        h2.componentDidUpdate(v2, y2, _2);
      });
    }
    if (h2.context = M2, h2.props = b, h2.__P = n2, h2.__e = false, P2 = l$1.__r, A2 = 0, S2) {
      for (h2.state = h2.__s, h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), H = 0; H < h2._sb.length; H++) h2.__h.push(h2._sb[H]);
      h2._sb = [];
    } else do {
      h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
    } while (h2.__d && ++A2 < 25);
    h2.state = h2.__s, null != h2.getChildContext && (i2 = w$1(w$1({}, i2), h2.getChildContext())), S2 && !p2 && null != h2.getSnapshotBeforeUpdate && (_2 = h2.getSnapshotBeforeUpdate(v2, y2)), L2 = a2, null != a2 && a2.type === k$1 && null == a2.key && (L2 = V(a2.props.children)), f2 = I(n2, d$1(L2) ? L2 : [L2], u2, t2, i2, o2, r2, e2, f2, c2, s2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), m2 && (h2.__E = h2.__ = null);
  } catch (n3) {
    if (u2.__v = null, c2 || null != r2) if (n3.then) {
      for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
      r2[r2.indexOf(f2)] = null, u2.__e = f2;
    } else {
      for (T2 = r2.length; T2--; ) g(r2[T2]);
      z$1(u2);
    }
    else u2.__e = t2.__e, u2.__k = t2.__k, n3.then || z$1(u2);
    l$1.__e(n3, u2, t2);
  }
  else null == r2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = q$1(t2.__e, u2, t2, i2, o2, r2, e2, c2, s2);
  return (a2 = l$1.diffed) && a2(u2), 128 & u2.__u ? void 0 : f2;
}
function z$1(n2) {
  n2 && n2.__c && (n2.__c.__e = true), n2 && n2.__k && n2.__k.forEach(z$1);
}
function N(n2, u2, t2) {
  for (var i2 = 0; i2 < t2.length; i2++) B$1(t2[i2], t2[++i2], t2[++i2]);
  l$1.__c && l$1.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l$1.__e(n3, u3.__v);
    }
  });
}
function V(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b && n2.__b > 0 ? n2 : d$1(n2) ? n2.map(V) : w$1({}, n2);
}
function q$1(u2, t2, i2, o2, r2, e2, f2, c2, s2) {
  var a2, h2, v2, y2, w2, _2, m2, b = i2.props || p$1, k2 = t2.props, x2 = t2.type;
  if ("svg" == x2 ? r2 = "http://www.w3.org/2000/svg" : "math" == x2 ? r2 = "http://www.w3.org/1998/Math/MathML" : r2 || (r2 = "http://www.w3.org/1999/xhtml"), null != e2) {
    for (a2 = 0; a2 < e2.length; a2++) if ((w2 = e2[a2]) && "setAttribute" in w2 == !!x2 && (x2 ? w2.localName == x2 : 3 == w2.nodeType)) {
      u2 = w2, e2[a2] = null;
      break;
    }
  }
  if (null == u2) {
    if (null == x2) return document.createTextNode(k2);
    u2 = document.createElementNS(r2, x2, k2.is && k2), c2 && (l$1.__m && l$1.__m(t2, e2), c2 = false), e2 = null;
  }
  if (null == x2) b === k2 || c2 && u2.data == k2 || (u2.data = k2);
  else {
    if (e2 = e2 && n.call(u2.childNodes), !c2 && null != e2) for (b = {}, a2 = 0; a2 < u2.attributes.length; a2++) b[(w2 = u2.attributes[a2]).name] = w2.value;
    for (a2 in b) if (w2 = b[a2], "children" == a2) ;
    else if ("dangerouslySetInnerHTML" == a2) v2 = w2;
    else if (!(a2 in k2)) {
      if ("value" == a2 && "defaultValue" in k2 || "checked" == a2 && "defaultChecked" in k2) continue;
      j$1(u2, a2, null, w2, r2);
    }
    for (a2 in k2) w2 = k2[a2], "children" == a2 ? y2 = w2 : "dangerouslySetInnerHTML" == a2 ? h2 = w2 : "value" == a2 ? _2 = w2 : "checked" == a2 ? m2 = w2 : c2 && "function" != typeof w2 || b[a2] === w2 || j$1(u2, a2, w2, b[a2], r2);
    if (h2) c2 || v2 && (h2.__html == v2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
    else if (v2 && (u2.innerHTML = ""), I("template" == t2.type ? u2.content : u2, d$1(y2) ? y2 : [y2], t2, i2, o2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : r2, e2, f2, e2 ? e2[0] : i2.__k && S(i2, 0), c2, s2), null != e2) for (a2 = e2.length; a2--; ) g(e2[a2]);
    c2 || (a2 = "value", "progress" == x2 && null == _2 ? u2.removeAttribute("value") : null != _2 && (_2 !== u2[a2] || "progress" == x2 && !_2 || "option" == x2 && _2 != b[a2]) && j$1(u2, a2, _2, b[a2], r2), a2 = "checked", null != m2 && m2 != u2[a2] && j$1(u2, a2, m2, b[a2], r2));
  }
  return u2;
}
function B$1(n2, u2, t2) {
  try {
    if ("function" == typeof n2) {
      var i2 = "function" == typeof n2.__u;
      i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
    } else n2.current = u2;
  } catch (n3) {
    l$1.__e(n3, t2);
  }
}
function D$1(n2, u2, t2) {
  var i2, o2;
  if (l$1.unmount && l$1.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || B$1(i2, null, u2)), null != (i2 = n2.__c)) {
    if (i2.componentWillUnmount) try {
      i2.componentWillUnmount();
    } catch (n3) {
      l$1.__e(n3, u2);
    }
    i2.base = i2.__P = null;
  }
  if (i2 = n2.__k) for (o2 = 0; o2 < i2.length; o2++) i2[o2] && D$1(i2[o2], u2, t2 || "function" != typeof n2.type);
  t2 || g(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function E(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function G(u2, t2, i2) {
  var o2, r2, e2, f2;
  t2 == document && (t2 = document.documentElement), l$1.__ && l$1.__(u2, t2), r2 = (o2 = false) ? null : t2.__k, e2 = [], f2 = [], O(t2, u2 = t2.__k = _(k$1, null, [u2]), r2 || p$1, p$1, t2.namespaceURI, r2 ? null : t2.firstChild ? n.call(t2.childNodes) : null, e2, r2 ? r2.__e : t2.firstChild, o2, f2), N(e2, u2, f2);
}
n = v$1.slice, l$1 = { __e: function(n2, l2, u2, t2) {
  for (var i2, o2, r2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((o2 = i2.constructor) && null != o2.getDerivedStateFromError && (i2.setState(o2.getDerivedStateFromError(n2)), r2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), r2 = i2.__d), r2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, u$2 = 0, x.prototype.setState = function(n2, l2) {
  var u2;
  u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = w$1({}, this.state), "function" == typeof n2 && (n2 = n2(w$1({}, u2), this.props)), n2 && w$1(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), M(this));
}, x.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
}, x.prototype.render = k$1, i$1 = [], r$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$1 = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, $.__r = 0, f$2 = /(PointerCapture)$|Capture$/i, c$1 = 0, s$2 = F(false), a$1 = F(true);
var f$1 = 0;
function u$1(e2, t2, n2, o2, i2, u2) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f$1, __i: -1, __u: 0, __source: i2, __self: u2 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l$1.vnode && l$1.vnode(l2), l2;
}
var t, r, u, i, o = 0, f = [], c = l$1, e = c.__b, a = c.__r, v = c.diffed, l = c.__c, m = c.unmount, s$1 = c.__;
function p(n2, t2) {
  c.__h && c.__h(r, n2, o || t2), o = 0;
  var u2 = r.__H || (r.__H = { __: [], __h: [] });
  return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
}
function d(n2) {
  return o = 1, h(D, n2);
}
function h(n2, u2, i2) {
  var o2 = p(t++, 2);
  if (o2.t = n2, !o2.__c && (o2.__ = [D(void 0, u2), function(n3) {
    var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
    t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r, !r.__f)) {
    var f2 = function(n3, t2, r2) {
      if (!o2.__c.__H) return true;
      var u3 = o2.__c.__H.__.filter(function(n4) {
        return !!n4.__c;
      });
      if (u3.every(function(n4) {
        return !n4.__N;
      })) return !c2 || c2.call(this, n3, t2, r2);
      var i3 = o2.__c.props !== n3;
      return u3.forEach(function(n4) {
        if (n4.__N) {
          var t3 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
        }
      }), c2 && c2.call(this, n3, t2, r2) || i3;
    };
    r.__f = true;
    var c2 = r.shouldComponentUpdate, e2 = r.componentWillUpdate;
    r.componentWillUpdate = function(n3, t2, r2) {
      if (this.__e) {
        var u3 = c2;
        c2 = void 0, f2(n3, t2, r2), c2 = u3;
      }
      e2 && e2.call(this, n3, t2, r2);
    }, r.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
}
function y(n2, u2) {
  var i2 = p(t++, 3);
  !c.__s && C(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r.__H.__h.push(i2));
}
function A(n2) {
  return o = 5, T(function() {
    return { current: n2 };
  }, []);
}
function T(n2, r2) {
  var u2 = p(t++, 7);
  return C(u2.__H, r2) && (u2.__ = n2(), u2.__H = r2, u2.__h = n2), u2.__;
}
function q(n2, t2) {
  return o = 8, T(function() {
    return n2;
  }, t2);
}
function j() {
  for (var n2; n2 = f.shift(); ) if (n2.__P && n2.__H) try {
    n2.__H.__h.forEach(z), n2.__H.__h.forEach(B), n2.__H.__h = [];
  } catch (t2) {
    n2.__H.__h = [], c.__e(t2, n2.__v);
  }
}
c.__b = function(n2) {
  r = null, e && e(n2);
}, c.__ = function(n2, t2) {
  n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), s$1 && s$1(n2, t2);
}, c.__r = function(n2) {
  a && a(n2), t = 0;
  var i2 = (r = n2.__c).__H;
  i2 && (u === r ? (i2.__h = [], r.__h = [], i2.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i2.__h.forEach(z), i2.__h.forEach(B), i2.__h = [], t = 0)), u = r;
}, c.diffed = function(n2) {
  v && v(n2);
  var t2 = n2.__c;
  t2 && t2.__H && (t2.__H.__h.length && (1 !== f.push(t2) && i === c.requestAnimationFrame || ((i = c.requestAnimationFrame) || w)(j)), t2.__H.__.forEach(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = void 0;
  })), u = r = null;
}, c.__c = function(n2, t2) {
  t2.some(function(n3) {
    try {
      n3.__h.forEach(z), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B(n4);
      });
    } catch (r2) {
      t2.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t2 = [], c.__e(r2, n3.__v);
    }
  }), l && l(n2, t2);
}, c.unmount = function(n2) {
  m && m(n2);
  var t2, r2 = n2.__c;
  r2 && r2.__H && (r2.__H.__.forEach(function(n3) {
    try {
      z(n3);
    } catch (n4) {
      t2 = n4;
    }
  }), r2.__H = void 0, t2 && c.__e(t2, r2.__v));
};
var k = "function" == typeof requestAnimationFrame;
function w(n2) {
  var t2, r2 = function() {
    clearTimeout(u2), k && cancelAnimationFrame(t2), setTimeout(n2);
  }, u2 = setTimeout(r2, 35);
  k && (t2 = requestAnimationFrame(r2));
}
function z(n2) {
  var t2 = r, u2 = n2.__c;
  "function" == typeof u2 && (n2.__c = void 0, u2()), r = t2;
}
function B(n2) {
  var t2 = r;
  n2.__c = n2.__(), r = t2;
}
function C(n2, t2) {
  return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
    return t3 !== n2[r2];
  });
}
function D(n2, t2) {
  return "function" == typeof t2 ? t2(n2) : t2;
}
function isBlock(node) {
  return "children" in node;
}
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}
const NODE_KEY = /* @__PURE__ */ Symbol("node_key");
const nodeKeys = /* @__PURE__ */ new WeakMap();
function getNodeKey(node) {
  const keyed = node;
  let key = keyed[NODE_KEY] || nodeKeys.get(node);
  if (!key) {
    key = generateId();
    keyed[NODE_KEY] = key;
  }
  nodeKeys.set(node, key);
  return key;
}
function stepSeconds(step) {
  return step.unit === "m" ? step.duration * 60 : step.duration;
}
function calcDuration(nodes) {
  let total = 0;
  for (const node of nodes) {
    if (isBlock(node)) {
      total += calcDuration(node.children) * node.repeats;
    } else {
      total += stepSeconds(node);
    }
  }
  return total;
}
function formatDuration(seconds) {
  const m2 = Math.floor(seconds / 60);
  const s2 = seconds % 60;
  if (m2 === 0) return `${s2}s`;
  return `${m2}m ${s2}s`;
}
function formatDateTime(iso) {
  const d2 = new Date(iso);
  const pad = (n2) => n2.toString().padStart(2, "0");
  return `${d2.getFullYear()}-${pad(d2.getMonth() + 1)}-${pad(d2.getDate())} ${pad(d2.getHours())}:${pad(d2.getMinutes())}`;
}
function validateRoutine(obj) {
  if (!obj || typeof obj !== "object") return false;
  const r2 = obj;
  const isStr = (v2) => typeof v2 === "string";
  const isOptStr = (v2) => typeof v2 === "undefined" || isStr(v2);
  const isValidNode = (node) => {
    if (!node || typeof node !== "object") return false;
    const n2 = node;
    if (Array.isArray(n2.children)) {
      return isStr(n2.label) && Number.isInteger(n2.repeats) && n2.repeats > 0 && n2.children.every(isValidNode);
    }
    return isStr(n2.label) && typeof n2.duration === "number" && Number.isFinite(n2.duration) && n2.duration > 0 && (typeof n2.unit === "undefined" || n2.unit === "s" || n2.unit === "m") && (typeof n2.pause === "undefined" || typeof n2.pause === "boolean");
  };
  return isStr(r2.name) && isOptStr(r2.created) && isOptStr(r2.edited) && isOptStr(r2.executed) && Array.isArray(r2.data) && r2.data.every(isValidNode);
}
const KEYS = {
  routines: "gr_routines",
  history: "gr_history",
  settings: "gr_settings",
  historySha: "gr_history_sha"
};
const DEFAULT_SETTINGS = {
  githubToken: "",
  repo: "",
  warmupDuration: 0,
  announceCurrent: true,
  announceNext: true,
  announceNextSeconds: 10,
  announceHalfway: false,
  announceCompletion: true,
  enableBeeps: true,
  announceLang: "",
  announceVoiceURI: ""
};
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadRoutines() {
  const raw = read(KEYS.routines, {});
  const result = {};
  const invalid = [];
  for (const [filename, obj] of Object.entries(raw)) {
    if (validateRoutine(obj)) {
      result[filename] = obj;
    } else {
      invalid.push(filename);
    }
  }
  if (invalid.length > 0) {
    write(KEYS.routines, result);
  }
  return result;
}
function getInvalidRoutineNames() {
  const raw = read(KEYS.routines, {});
  return Object.keys(raw).filter((k2) => !validateRoutine(raw[k2]));
}
function saveRoutines(routines) {
  write(KEYS.routines, routines);
}
function saveRoutine(filename, routine) {
  const routines = loadRoutines();
  routines[filename] = routine;
  saveRoutines(routines);
}
function deleteRoutine(filename) {
  const routines = loadRoutines();
  delete routines[filename];
  saveRoutines(routines);
}
function getRoutine(filename) {
  return loadRoutines()[filename];
}
function slugify(name2) {
  return name2.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "routine";
}
function uniqueFilename(base) {
  const routines = loadRoutines();
  if (!(base in routines)) return base;
  let i2 = 2;
  while (`${base}-${i2}` in routines) i2++;
  return `${base}-${i2}`;
}
function loadHistory() {
  return read(KEYS.history, []);
}
function saveHistory(logs) {
  write(KEYS.history, logs);
}
function addSessionLog(log) {
  const history = loadHistory();
  history.unshift(log);
  saveHistory(history);
}
function deleteSessionLog(id) {
  saveHistory(loadHistory().filter((l2) => l2.id !== id));
}
function loadSettings() {
  return read(KEYS.settings, DEFAULT_SETTINGS);
}
function saveSettings(settings) {
  write(KEYS.settings, settings);
}
function getRoutineSha(filename) {
  return localStorage.getItem(`gr_routine_sha_${filename}`) || "";
}
function setRoutineSha(filename, sha) {
  localStorage.setItem(`gr_routine_sha_${filename}`, sha);
}
function removeRoutineSha(filename) {
  localStorage.removeItem(`gr_routine_sha_${filename}`);
}
function getHistorySha() {
  return localStorage.getItem(KEYS.historySha) || "";
}
function setHistorySha(sha) {
  localStorage.setItem(KEYS.historySha, sha);
}
const API = "https://api.github.com";
async function ghFetch(path, token, options = {}) {
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options.headers
    }
  });
}
async function validateToken(token) {
  const res = await ghFetch("/user", token);
  return res.ok;
}
async function listRepos(token) {
  const res = await ghFetch("/user/repos?per_page=100&sort=updated", token);
  if (!res.ok) return [];
  const data2 = await res.json();
  return data2.map((r2) => ({ full_name: r2.full_name, name: r2.name }));
}
async function getFile(repo, path, token) {
  const res = await ghFetch(`/repos/${repo}/contents/${path}`, token);
  if (!res.ok) return null;
  const data2 = await res.json();
  return {
    content: atob(data2.content.replace(/\n/g, "")),
    sha: data2.sha
  };
}
async function putFile(repo, path, content, sha, token, message) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content)))
  };
  if (sha) body.sha = sha;
  const res = await ghFetch(`/repos/${repo}/contents/${path}`, token, {
    method: "PUT",
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`Failed to save ${path}: ${res.status}`);
  }
  const data2 = await res.json();
  return data2.content.sha;
}
function isRoutineJsonFile(entry) {
  if (entry.type && entry.type !== "file") return false;
  return /\.json$/i.test(entry.name);
}
async function countRemoteRoutines(repo, token) {
  const res = await ghFetch(`/repos/${repo}/contents/routines`, token);
  if (!res.ok) return 0;
  const data2 = await res.json();
  if (!Array.isArray(data2)) return 0;
  const entries = data2;
  return entries.filter(isRoutineJsonFile).length;
}
async function pullRoutines(repo, token) {
  const res = await ghFetch(`/repos/${repo}/contents/routines`, token);
  if (!res.ok) return null;
  const data2 = await res.json();
  if (!Array.isArray(data2)) return null;
  const entries = data2;
  const jsonFiles = entries.filter(isRoutineJsonFile);
  const local = loadRoutines();
  let changed = false;
  const routines = { ...local };
  const errors = [];
  for (const entry of jsonFiles) {
    const filename = entry.name.replace(/\.json$/, "");
    const localSha = getRoutineSha(filename);
    if (localSha === entry.sha && local[filename]) {
      routines[filename] = local[filename];
      continue;
    }
    const file = await getFile(repo, entry.path, token);
    if (!file) continue;
    let parsed;
    try {
      parsed = JSON.parse(file.content);
    } catch {
      errors.push(filename);
      continue;
    }
    if (!validateRoutine(parsed)) {
      errors.push(filename);
      continue;
    }
    routines[filename] = parsed;
    setRoutineSha(filename, entry.sha);
    changed = true;
  }
  if (changed) {
    saveRoutines(routines);
  }
  if (!changed && errors.length === 0) return null;
  return { routines, errors };
}
async function pushRoutine(repo, token, filename, routine) {
  const path = `routines/${filename}.json`;
  const sha = getRoutineSha(filename);
  const content = JSON.stringify(routine, null, 2);
  const msg = sha ? `Update routine: ${routine.name}` : `Create routine: ${routine.name}`;
  const newSha = await putFile(repo, path, content, sha, token, msg);
  setRoutineSha(filename, newSha);
}
async function deleteRoutineRemote(repo, token, filename) {
  const path = `routines/${filename}.json`;
  let sha = getRoutineSha(filename);
  if (!sha) {
    const file = await getFile(repo, path, token);
    sha = file?.sha || "";
  }
  if (!sha) return;
  const res = await ghFetch(`/repos/${repo}/contents/${path}`, token, {
    method: "DELETE",
    body: JSON.stringify({ message: `Delete routine: ${filename}`, sha })
  });
  if (res.status === 404) {
    removeRoutineSha(filename);
    return;
  }
  if (!res.ok) {
    throw new Error(`Failed to delete ${path}: ${res.status}`);
  }
  removeRoutineSha(filename);
}
async function pullHistory(repo, token) {
  const file = await getFile(repo, "history.json", token);
  if (!file) return null;
  const remoteSha = file.sha;
  const localSha = getHistorySha();
  if (remoteSha === localSha) return null;
  let history;
  try {
    const parsed = JSON.parse(file.content);
    if (!Array.isArray(parsed)) return null;
    history = parsed;
  } catch {
    return null;
  }
  saveHistory(history);
  setHistorySha(remoteSha);
  return history;
}
async function pushHistory(repo, token, routineName) {
  const history = loadHistory();
  const sha = getHistorySha();
  const content = JSON.stringify(history, null, 2);
  const msg = routineName ? `Record execution ${routineName}` : sha ? "Update session history" : "Create session history";
  const newSha = await putFile(repo, "history.json", content, sha, token, msg);
  setHistorySha(newSha);
}
let container = null;
function getContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}
function showToast(message, type = "error", persistent = false) {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  const text = document.createElement("span");
  text.textContent = message;
  el.appendChild(text);
  if (persistent) {
    const close = document.createElement("button");
    close.className = "toast-close u-icon";
    close.innerHTML = "✕";
    close.onclick = () => {
      el.classList.add("toast-out");
      el.addEventListener("transitionend", () => el.remove());
    };
    el.appendChild(close);
  } else {
    setTimeout(() => {
      el.classList.add("toast-out");
      el.addEventListener("transitionend", () => el.remove());
    }, 3e3);
  }
  getContainer().appendChild(el);
}
const s = (sz) => ({
  width: sz,
  height: sz,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
});
const ArrowLeft = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { ...s(size), children: [
  /* @__PURE__ */ u$1("path", { d: "m12 19-7-7 7-7" }),
  /* @__PURE__ */ u$1("path", { d: "M19 12H5" })
] });
const X = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { ...s(size), children: [
  /* @__PURE__ */ u$1("path", { d: "M18 6 6 18" }),
  /* @__PURE__ */ u$1("path", { d: "m6 6 12 12" })
] });
const Pencil = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { ...s(size), children: [
  /* @__PURE__ */ u$1("path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }),
  /* @__PURE__ */ u$1("path", { d: "m15 5 4 4" })
] });
const Play = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { ...s(size), fill: "currentColor", stroke: "none", children: /* @__PURE__ */ u$1("polygon", { points: "5 3 19 12 5 21 5 3" }) });
const Pause = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { ...s(size), fill: "currentColor", stroke: "none", children: [
  /* @__PURE__ */ u$1("rect", { x: "6", y: "4", width: "4", height: "16" }),
  /* @__PURE__ */ u$1("rect", { x: "14", y: "4", width: "4", height: "16" })
] });
const SkipBack = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", stroke: "none", children: [
  /* @__PURE__ */ u$1("polygon", { points: "19 20 9 12 19 4 19 20" }),
  /* @__PURE__ */ u$1("rect", { x: "5", y: "4", width: "3", height: "16" })
] });
const SkipForward = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", stroke: "none", children: [
  /* @__PURE__ */ u$1("polygon", { points: "5 4 15 12 5 20 5 4" }),
  /* @__PURE__ */ u$1("rect", { x: "16", y: "4", width: "3", height: "16" })
] });
const Delete = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { ...s(size), children: [
  /* @__PURE__ */ u$1("path", { d: "M3 6h18" }),
  /* @__PURE__ */ u$1("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
  /* @__PURE__ */ u$1("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
] });
const Settings$1 = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { ...s(size), children: [
  /* @__PURE__ */ u$1("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
  /* @__PURE__ */ u$1("circle", { cx: "12", cy: "12", r: "3" })
] });
const ExternalLink = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { ...s(size), children: [
  /* @__PURE__ */ u$1("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
  /* @__PURE__ */ u$1("polyline", { points: "15 3 21 3 21 9" }),
  /* @__PURE__ */ u$1("line", { x1: "10", y1: "14", x2: "21", y2: "3" })
] });
const Info = ({ size = 18 }) => /* @__PURE__ */ u$1("svg", { ...s(size), children: [
  /* @__PURE__ */ u$1("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ u$1("path", { d: "M12 16v-4" }),
  /* @__PURE__ */ u$1("path", { d: "M12 8h.01" })
] });
function Dashboard() {
  const [routines, setRoutines] = d(() => loadRoutines());
  const [syncing, setSyncing] = d(false);
  y(() => {
    const invalid = getInvalidRoutineNames();
    if (invalid.length > 0) {
      showToast(`Invalid routines removed: ${invalid.join(", ")}`);
    }
  }, []);
  y(() => {
    const settings = loadSettings();
    if (!settings.githubToken || !settings.repo) return;
    setSyncing(true);
    pullRoutines(settings.repo, settings.githubToken).then((result) => {
      if (result) {
        setRoutines(result.routines);
        if (result.errors.length > 0) {
          showToast(`Invalid routines: ${result.errors.join(", ")}`);
        }
      }
    }).catch(() => showToast("GitHub sync failed")).finally(() => setSyncing(false));
  }, []);
  const handleNew = () => {
    const filename = uniqueFilename(slugify("new-routine"));
    const routine = {
      name: "New Routine",
      created: (/* @__PURE__ */ new Date()).toISOString(),
      edited: (/* @__PURE__ */ new Date()).toISOString(),
      data: []
    };
    saveRoutine(filename, routine);
    navigate("edit/" + filename);
  };
  const handleDelete = (filename) => {
    deleteRoutine(filename);
    setRoutines(loadRoutines());
    const s2 = loadSettings();
    if (s2.githubToken && s2.repo) {
      deleteRoutineRemote(s2.repo, s2.githubToken, filename).catch(() => showToast("GitHub sync failed"));
    }
  };
  const entries = Object.entries(routines);
  return /* @__PURE__ */ u$1("div", { children: [
    /* @__PURE__ */ u$1("div", { class: "header", children: [
      /* @__PURE__ */ u$1("h1", { children: [
        "GitRoutine ",
        syncing && /* @__PURE__ */ u$1("span", { style: "font-size:12px;color:var(--text2)", children: "syncing..." })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "header-actions", children: [
        /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate("history"), style: "width:auto;padding:0 12px", children: "History" }),
        /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate("settings"), title: "Settings", children: /* @__PURE__ */ u$1(Settings$1, { size: 20 }) }),
        /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: handleNew, title: "New routine", children: "+" })
      ] })
    ] }),
    entries.length === 0 ? /* @__PURE__ */ u$1("div", { class: "empty", children: [
      /* @__PURE__ */ u$1("p", { children: "No routines yet." }),
      /* @__PURE__ */ u$1("p", { style: "margin-top:8px", children: "Create one to get started." })
    ] }) : entries.map(([filename, r2]) => /* @__PURE__ */ u$1("div", { class: "card", children: /* @__PURE__ */ u$1("div", { class: "card-row", children: [
      /* @__PURE__ */ u$1("div", { children: [
        /* @__PURE__ */ u$1("div", { class: "card-title", children: r2.name }),
        /* @__PURE__ */ u$1("div", { class: "card-sub", children: [
          "Executed: ",
          r2.executed ? formatDateTime(r2.executed) : "never"
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { style: "display:flex;gap:6px", children: [
        /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate("run/" + filename), title: "Start", children: /* @__PURE__ */ u$1(Play, { size: 20 }) }),
        /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate("edit/" + filename), title: "Edit", children: /* @__PURE__ */ u$1(Pencil, { size: 20 }) }),
        /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => handleDelete(filename), title: "Delete", style: "color:var(--danger)", children: /* @__PURE__ */ u$1(Delete, { size: 20 }) })
      ] })
    ] }) }, filename))
  ] });
}
function createStep(step = {}) {
  return {
    label: "Step",
    duration: 30,
    ...step
  };
}
function createBlock(block = {}) {
  return {
    label: "Block",
    repeats: 1,
    children: [],
    ...block
  };
}
function NodeEditor({ node, onUpdate, onDelete, onDragStart, onDragOver, onDrop }) {
  const [dragOver, setDragOver] = d(false);
  if (isBlock(node)) {
    const block = node;
    const appendChild = (child) => {
      onUpdate({
        ...block,
        children: [...block.children, child]
      });
    };
    const updateChild = (index, child) => {
      const children = [...block.children];
      children[index] = child;
      onUpdate({ ...block, children });
    };
    const deleteChild = (index) => {
      const children = block.children.filter((_2, i2) => i2 !== index);
      onUpdate({ ...block, children });
    };
    const addStep = () => {
      appendChild(createStep());
    };
    const addBlock = () => {
      appendChild(createBlock());
    };
    const addBreak = () => {
      appendChild(createStep({ label: "Break" }));
    };
    const addPause = () => {
      appendChild(createStep({ label: "Pause", duration: 5, pause: true }));
    };
    const blockKey = getNodeKey(block);
    return /* @__PURE__ */ u$1(
      "div",
      {
        class: `editor-node ${dragOver ? "drag-over" : ""}`,
        onDragOver: (e2) => {
          e2.preventDefault();
          setDragOver(true);
          onDragOver(e2);
        },
        onDragLeave: () => setDragOver(false),
        onDrop: (e2) => {
          setDragOver(false);
          onDrop(e2);
        },
        children: [
          /* @__PURE__ */ u$1("div", { class: "editor-node-header", draggable: true, onDragStart, children: [
            /* @__PURE__ */ u$1("span", { class: "editor-block-tag", children: "Block" }),
            /* @__PURE__ */ u$1(
              "input",
              {
                class: "inline-input",
                value: block.label,
                onInput: (e2) => onUpdate({ ...block, label: e2.target.value }),
                style: "flex:1"
              }
            ),
            /* @__PURE__ */ u$1("span", { class: "editor-block-total", title: formatDuration(calcDuration(block.children) * block.repeats), children: formatDuration(calcDuration(block.children) * block.repeats) }),
            /* @__PURE__ */ u$1("span", { class: "editor-repeat-label", children: "Repeat:" }),
            /* @__PURE__ */ u$1("div", { class: "num-stepper", children: [
              /* @__PURE__ */ u$1("button", { class: "num-stepper-btn", type: "button", onClick: () => {
                if (block.repeats > 1) onUpdate({ ...block, repeats: block.repeats - 1 });
              }, children: "-" }),
              /* @__PURE__ */ u$1(
                "input",
                {
                  type: "number",
                  class: "inline-input repeats-input",
                  value: block.repeats,
                  onInput: (e2) => {
                    const v2 = parseInt(e2.target.value);
                    if (v2 > 0) onUpdate({ ...block, repeats: v2 });
                  },
                  min: "1"
                }
              ),
              /* @__PURE__ */ u$1("button", { class: "num-stepper-btn", type: "button", onClick: () => onUpdate({ ...block, repeats: block.repeats + 1 }), children: "+" })
            ] }),
            /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: onDelete, title: "Delete", style: "color:var(--danger)", children: /* @__PURE__ */ u$1(Delete, { size: 16 }) })
          ] }),
          /* @__PURE__ */ u$1("div", { class: "editor-node-body", children: [
            block.children.map((child, i2) => /* @__PURE__ */ u$1(
              NodeEditor,
              {
                node: child,
                onUpdate: (n2) => updateChild(i2, n2),
                onDelete: () => deleteChild(i2),
                onDragStart: (e2) => {
                  e2.stopPropagation();
                  e2.dataTransfer.setData("text/plain", JSON.stringify({ parentId: blockKey, index: i2 }));
                  e2.dataTransfer.effectAllowed = "move";
                },
                onDragOver: (e2) => e2.preventDefault(),
                onDrop: (e2) => {
                  e2.preventDefault();
                  e2.stopPropagation();
                  try {
                    const data2 = JSON.parse(e2.dataTransfer.getData("text/plain"));
                    if (data2.parentId === blockKey && data2.index !== i2) {
                      const children = [...block.children];
                      const [moved] = children.splice(data2.index, 1);
                      children.splice(i2, 0, moved);
                      onUpdate({ ...block, children });
                    }
                  } catch {
                  }
                }
              },
              getNodeKey(child)
            )),
            /* @__PURE__ */ u$1("div", { class: "editor-actions", children: [
              /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: addStep, children: "+ Step" }),
              /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: addBlock, style: "background:var(--surface2)", children: "+ Block" }),
              /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: addBreak, style: "background:var(--surface2)", children: "+ Break" }),
              /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: addPause, style: "background:var(--surface2)", children: "+ Pause" })
            ] })
          ] })
        ]
      }
    );
  }
  const step = node;
  return /* @__PURE__ */ u$1(
    "div",
    {
      class: `editor-node ${dragOver ? "drag-over" : ""}`,
      onDragOver: (e2) => {
        e2.preventDefault();
        setDragOver(true);
        onDragOver(e2);
      },
      onDragLeave: () => setDragOver(false),
      onDrop: (e2) => {
        setDragOver(false);
        onDrop(e2);
      },
      children: /* @__PURE__ */ u$1("div", { class: "editor-node-header", draggable: true, onDragStart, children: [
        /* @__PURE__ */ u$1("span", { class: "editor-step-tag", children: "Step" }),
        /* @__PURE__ */ u$1(
          "input",
          {
            class: "inline-input",
            value: step.label,
            onInput: (e2) => onUpdate({ ...step, label: e2.target.value }),
            style: "flex:1"
          }
        ),
        /* @__PURE__ */ u$1("div", { class: "num-stepper", children: [
          /* @__PURE__ */ u$1("button", { class: "num-stepper-btn", type: "button", onClick: () => {
            const inc = step.unit === "m" ? 1 : 10;
            if (step.duration > inc) onUpdate({ ...step, duration: step.duration - inc });
          }, children: "-" }),
          /* @__PURE__ */ u$1(
            "input",
            {
              type: "number",
              class: "inline-input duration-input",
              value: step.duration,
              onInput: (e2) => {
                const v2 = parseInt(e2.target.value);
                if (v2 > 0) onUpdate({ ...step, duration: v2 });
              },
              min: "1"
            }
          ),
          /* @__PURE__ */ u$1("button", { class: "num-stepper-btn", type: "button", onClick: () => {
            const inc = step.unit === "m" ? 1 : 10;
            onUpdate({ ...step, duration: step.duration + inc });
          }, children: "+" }),
          /* @__PURE__ */ u$1("button", { type: "button", class: "num-stepper-btn num-stepper-unit", onClick: () => onUpdate({ ...step, unit: step.unit === "m" ? "s" : "m" }), children: step.unit === "m" ? "m" : "s" })
        ] }),
        /* @__PURE__ */ u$1(
          "button",
          {
            class: "btn-icon",
            "aria-pressed": step.pause,
            onClick: () => onUpdate({ ...step, pause: !step.pause }),
            title: step.pause ? "Pause (on)" : "Pause (off)",
            children: /* @__PURE__ */ u$1(Pause, { size: 16 })
          }
        ),
        /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: onDelete, title: "Delete", style: "color:var(--danger)", children: /* @__PURE__ */ u$1(Delete, { size: 16 }) })
      ] })
    }
  );
}
function Editor({ filename: initialFilename }) {
  const loaded = A(getRoutine(initialFilename));
  const [routine, setRoutine] = d(loaded.current ?? null);
  const [saving, setSaving] = d(false);
  const [filename, setFilename] = d(initialFilename);
  const currentFilenameRef = A(initialFilename);
  const markEdited = (next) => ({
    ...next,
    edited: (/* @__PURE__ */ new Date()).toISOString()
  });
  const persistLocal = (nextFilename, nextRoutine) => {
    saveRoutine(nextFilename, nextRoutine);
    setRoutine(nextRoutine);
    setFilename(nextFilename);
  };
  if (!routine) {
    return /* @__PURE__ */ u$1("div", { children: [
      /* @__PURE__ */ u$1("div", { class: "header", children: [
        /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate(""), children: /* @__PURE__ */ u$1(ArrowLeft, { size: 18 }) }),
        /* @__PURE__ */ u$1("h1", { children: "Not Found" })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "empty", children: "Routine not found." })
    ] });
  }
  const updateNode = (index, node) => {
    setRoutine((prev) => {
      if (!prev) return prev;
      const data2 = [...prev.data];
      data2[index] = node;
      return markEdited({ ...prev, data: data2 });
    });
  };
  const deleteNode = (index) => {
    setRoutine((prev) => {
      if (!prev) return prev;
      const data2 = prev.data.filter((_2, i2) => i2 !== index);
      return markEdited({ ...prev, data: data2 });
    });
  };
  const addNode = (node) => {
    setRoutine((prev) => {
      if (!prev) return prev;
      return markEdited({
        ...prev,
        data: [...prev.data, node]
      });
    });
  };
  const addStep = () => {
    addNode(createStep());
  };
  const addBlock = () => {
    addNode(createBlock());
  };
  const addBreak = () => {
    addNode(createStep({ label: "Break" }));
  };
  const addPause = () => {
    addNode(createStep({ label: "Pause step", duration: 5, pause: true }));
  };
  const handleSave = async () => {
    if (!routine) return;
    const oldFilename = currentFilenameRef.current;
    const newFilename = filename.replace(/\.json$/, "").trim() || currentFilenameRef.current;
    const renamed = newFilename !== oldFilename;
    const updated = markEdited(routine);
    if (renamed) {
      deleteRoutine(oldFilename);
      currentFilenameRef.current = newFilename;
    }
    persistLocal(newFilename, updated);
    const settings = loadSettings();
    if (settings.githubToken && settings.repo) {
      setSaving(true);
      try {
        await pushRoutine(settings.repo, settings.githubToken, newFilename, updated);
        if (renamed) {
          await deleteRoutineRemote(settings.repo, settings.githubToken, oldFilename);
        }
        showToast("Saved", "success");
      } catch {
        showToast("GitHub sync failed");
      } finally {
        setSaving(false);
      }
    } else {
      if (renamed) {
        removeRoutineSha(oldFilename);
      }
      showToast("Saved", "success");
    }
  };
  return /* @__PURE__ */ u$1("div", { children: [
    /* @__PURE__ */ u$1("div", { class: "header", children: [
      /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate(""), children: /* @__PURE__ */ u$1(ArrowLeft, { size: 18 }) }),
      /* @__PURE__ */ u$1(
        "input",
        {
          class: "inline-input",
          value: routine.name,
          onInput: (e2) => {
            const name2 = e2.target.value;
            setRoutine((prev) => prev ? markEdited({ ...prev, name: name2 }) : prev);
          },
          style: "font-size:20px;font-weight:600;flex:1"
        }
      ),
      /* @__PURE__ */ u$1(
        "button",
        {
          class: "btn-icon",
          onClick: () => {
            const updated = markEdited(routine);
            persistLocal(currentFilenameRef.current, updated);
            navigate("run/" + currentFilenameRef.current);
          },
          title: "Run",
          children: /* @__PURE__ */ u$1(Play, { size: 20 })
        }
      ),
      /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: handleSave, disabled: saving, children: saving ? "Saving..." : "Save" })
    ] }),
    /* @__PURE__ */ u$1("div", { class: "field", style: "margin-bottom:8px", children: [
      /* @__PURE__ */ u$1("label", { children: "Filename" }),
      /* @__PURE__ */ u$1(
        "input",
        {
          value: filename,
          onInput: (e2) => setFilename(e2.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ u$1("div", { class: "editor-meta", style: "font-size:14px", children: [
      routine.executed && /* @__PURE__ */ u$1("div", { children: [
        /* @__PURE__ */ u$1("span", { class: "editor-meta-label", children: "Executed" }),
        " ",
        formatDateTime(routine.executed)
      ] }),
      routine.edited && /* @__PURE__ */ u$1("div", { children: [
        /* @__PURE__ */ u$1("span", { class: "editor-meta-label", children: "Updated" }),
        " ",
        formatDateTime(routine.edited)
      ] }),
      routine.created && /* @__PURE__ */ u$1("div", { children: [
        /* @__PURE__ */ u$1("span", { class: "editor-meta-label", children: "Created" }),
        " ",
        formatDateTime(routine.created)
      ] }),
      /* @__PURE__ */ u$1("div", { children: [
        /* @__PURE__ */ u$1("span", { class: "editor-meta-label", children: "Total" }),
        " ",
        formatDuration(calcDuration(routine.data))
      ] })
    ] }),
    routine.data.map((node, i2) => /* @__PURE__ */ u$1(
      NodeEditor,
      {
        node,
        onUpdate: (n2) => updateNode(i2, n2),
        onDelete: () => deleteNode(i2),
        onDragStart: () => {
        },
        onDragOver: (e2) => e2.preventDefault(),
        onDrop: () => {
        }
      },
      getNodeKey(node)
    )),
    /* @__PURE__ */ u$1("div", { class: "editor-actions", children: [
      /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: addStep, children: "+ Step" }),
      /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: addBlock, style: "background:var(--surface2)", children: "+ Block" }),
      /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: addBreak, style: "background:var(--surface2)", children: "+ Break" }),
      /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: addPause, style: "background:var(--surface2)", children: "+ Pause" })
    ] })
  ] });
}
function flatten(nodes) {
  const result = [];
  function walk(items) {
    for (const node of items) {
      if (isBlock(node)) {
        for (let i2 = 0; i2 < node.repeats; i2++) {
          walk(node.children);
        }
      } else {
        result.push({
          label: node.label,
          duration: stepSeconds(node),
          index: result.length,
          pause: node.pause
        });
      }
    }
  }
  walk(nodes);
  return result;
}
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}
function playBeep(frequency, durationMs = 150) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.value = 0.3;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + durationMs / 1e3);
}
function playCountdownBeep(secondsLeft) {
  if (secondsLeft === 3 || secondsLeft === 2) {
    playBeep(880, 150);
  } else if (secondsLeft === 1) {
    playBeep(440, 300);
  }
}
function unlockAudio() {
  getAudioContext().resume();
  if ("speechSynthesis" in window) {
    const u2 = new SpeechSynthesisUtterance("");
    u2.volume = 0;
    speechSynthesis.speak(u2);
  }
}
function speak(text, lang, voiceURI) {
  if (!("speechSynthesis" in window)) return;
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
  }
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.volume = 0.8;
    if (lang) utterance.lang = lang;
    if (voiceURI) {
      const voice = speechSynthesis.getVoices().find((v2) => v2.voiceURI === voiceURI);
      if (voice) utterance.voice = voice;
    }
    speechSynthesis.speak(utterance);
  }, 50);
}
const HALF_ANNOUNCE_MIN_SECONDS = 30;
function shouldAnnounceHalfway(stepDurationSeconds) {
  return stepDurationSeconds >= HALF_ANNOUNCE_MIN_SECONDS;
}
let wakeLock = null;
async function acquire() {
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    showToast(`Wake Lock failed: ${msg}`, "error", true);
  }
}
async function release() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}
function Runner({ filename }) {
  const routine = getRoutine(filename);
  const [steps] = d(() => routine ? flatten(routine.data) : []);
  const [currentIndex, setCurrentIndex] = d(0);
  const [timeLeft, setTimeLeft] = d(() => steps.length > 0 ? steps[0].duration : 0);
  const [running, setRunning] = d(false);
  const [done, setDone] = d(false);
  const [warmingUp, setWarmingUp] = d(false);
  const settings = A(loadSettings());
  const [warmupTimeLeft, setWarmupTimeLeft] = d(settings.current.warmupDuration);
  const say = (text) => {
    const s2 = settings.current;
    speak(text, s2.announceLang, s2.announceVoiceURI);
  };
  const startTimeRef = A(0);
  const sessionStartRef = A(Date.now());
  const lastTickRef = A(0);
  const rafRef = A(0);
  const currentIndexRef = A(0);
  const spokenCurrentRef = A(false);
  const spokenNextRef = A(false);
  const spokenHalfwayRef = A(false);
  const warmupDoneRef = A(false);
  const warmupRafRef = A(0);
  const warmupStartTimeRef = A(0);
  const warmupLastTickRef = A(0);
  y(() => {
    if (routine) {
      saveRoutine(filename, { ...routine, executed: (/* @__PURE__ */ new Date()).toISOString() });
    }
  }, []);
  const saveSession = q(() => {
    if (!routine) return;
    const log = {
      id: generateId(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      routineName: routine.name,
      durationSeconds: Math.round((Date.now() - sessionStartRef.current) / 1e3)
    };
    addSessionLog(log);
    const s2 = settings.current;
    if (s2.githubToken && s2.repo) {
      pushHistory(s2.repo, s2.githubToken, routine.name).catch(() => showToast("GitHub sync failed"));
    }
  }, [routine]);
  const handleExit = q(() => {
    cancelAnimationFrame(rafRef.current);
    cancelAnimationFrame(warmupRafRef.current);
    release();
    saveSession();
    navigate("");
  }, [saveSession]);
  y(() => {
    if (!warmingUp || steps.length === 0) return;
    warmupStartTimeRef.current = Date.now();
    warmupLastTickRef.current = warmupTimeLeft;
    const tick = () => {
      const elapsed = (Date.now() - warmupStartTimeRef.current) / 1e3;
      const remaining = Math.max(0, warmupLastTickRef.current - elapsed);
      setWarmupTimeLeft(remaining);
      const s2 = settings.current;
      if (s2.announceNext && !spokenNextRef.current && remaining <= s2.announceNextSeconds && steps.length > 0) {
        say("Next: " + steps[0].label);
        spokenNextRef.current = true;
      }
      if (remaining <= 0) {
        warmupDoneRef.current = true;
        setWarmingUp(false);
        spokenCurrentRef.current = false;
        spokenNextRef.current = false;
        spokenHalfwayRef.current = false;
        setRunning(true);
        return;
      }
      warmupRafRef.current = requestAnimationFrame(tick);
    };
    warmupRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(warmupRafRef.current);
  }, [warmingUp, warmupTimeLeft, steps]);
  y(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  const resetStep = q((nextIdx) => {
    currentIndexRef.current = nextIdx;
    setCurrentIndex(nextIdx);
    const duration = steps[nextIdx].duration;
    setTimeLeft(duration);
    startTimeRef.current = Date.now();
    lastTickRef.current = duration;
    spokenCurrentRef.current = false;
    spokenNextRef.current = false;
    spokenHalfwayRef.current = false;
  }, [steps]);
  y(() => {
    if (!running || done || steps.length === 0) return;
    startTimeRef.current = Date.now();
    lastTickRef.current = timeLeft;
    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1e3;
      const remaining = Math.max(0, lastTickRef.current - elapsed);
      setTimeLeft(remaining);
      const s2 = settings.current;
      const idx = currentIndexRef.current;
      if (s2.announceCurrent && !spokenCurrentRef.current) {
        say(steps[idx].label);
        spokenCurrentRef.current = true;
      }
      if (s2.announceNext && !spokenNextRef.current && remaining <= s2.announceNextSeconds) {
        const nextIdx = idx + 1;
        if (nextIdx < steps.length) {
          say("Next: " + steps[nextIdx].label);
        }
        spokenNextRef.current = true;
      }
      const halfDuration = steps[idx].duration / 2;
      if (s2.announceHalfway && shouldAnnounceHalfway(steps[idx].duration) && !spokenHalfwayRef.current && remaining <= halfDuration) {
        say("Halfway done");
        spokenHalfwayRef.current = true;
      }
      if (remaining <= 0) {
        if (steps[idx].pause) {
          setTimeLeft(0);
          setRunning(false);
          return;
        }
        const nextIdx = idx + 1;
        if (nextIdx >= steps.length) {
          setDone(true);
          setRunning(false);
          release();
          if (s2.announceCompletion) {
            say("Complete");
          }
          saveSession();
          return;
        }
        resetStep(nextIdx);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, done, steps, saveSession, resetStep]);
  const prevSecRef = A(-1);
  y(() => {
    const isActive2 = running || warmingUp;
    if (!isActive2 || !settings.current.enableBeeps) return;
    const time = warmingUp ? warmupTimeLeft : timeLeft;
    const sec = Math.ceil(time);
    if (sec !== prevSecRef.current && sec >= 1 && sec <= 3) {
      playCountdownBeep(sec);
    }
    prevSecRef.current = sec;
  }, [running, warmingUp, timeLeft, warmupTimeLeft]);
  y(() => {
    if (running || warmingUp) acquire();
    else release();
  }, [running, warmingUp]);
  if (!routine || steps.length === 0) {
    return /* @__PURE__ */ u$1("div", { children: [
      /* @__PURE__ */ u$1("div", { class: "header", children: [
        /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate(""), children: /* @__PURE__ */ u$1(ArrowLeft, { size: 20 }) }),
        /* @__PURE__ */ u$1("h1", { children: routine ? routine.name : "Not Found" })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "empty", children: routine ? "This routine has no steps." : "Routine not found." })
    ] });
  }
  const currentStep = steps[currentIndex];
  const pendingWarmup = !warmupDoneRef.current && settings.current.warmupDuration > 0 && !running && !done;
  const showWarmup = warmingUp || pendingWarmup;
  const activeTime = showWarmup ? warmupTimeLeft : timeLeft;
  const displayTime = Math.ceil(activeTime);
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const handlePlayPause = () => {
    unlockAudio();
    if (warmingUp) {
      setWarmingUp(false);
      return;
    }
    if (running) {
      setRunning(false);
      return;
    }
    if (timeLeft === 0 && steps[currentIndex].pause) {
      const nextIdx = currentIndex + 1;
      if (nextIdx >= steps.length) {
        setDone(true);
        release();
        if (settings.current.announceCompletion) say("Complete");
        saveSession();
        return;
      }
      resetStep(nextIdx);
      setRunning(true);
      return;
    }
    const s2 = settings.current;
    if (!warmupDoneRef.current && s2.warmupDuration > 0) {
      setWarmupTimeLeft((prev) => prev > 0 ? prev : s2.warmupDuration);
      setWarmingUp(true);
    } else {
      setRunning(true);
    }
  };
  const handlePrev = () => {
    if (warmingUp || done) return;
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      resetStep(prevIdx);
    } else {
      resetStep(0);
    }
  };
  const handleNext = () => {
    if (warmingUp) {
      warmupDoneRef.current = true;
      setWarmingUp(false);
      setRunning(true);
      return;
    }
    const wasPaused = !running && timeLeft === 0 && steps[currentIndex].pause;
    const nextIdx = currentIndex + 1;
    if (nextIdx >= steps.length) {
      setDone(true);
      setRunning(false);
      release();
      if (settings.current.announceCompletion) {
        say("Complete");
      }
      saveSession();
      return;
    }
    resetStep(nextIdx);
    if (wasPaused) setRunning(true);
  };
  const isActive = running || warmingUp;
  return /* @__PURE__ */ u$1("div", { children: [
    /* @__PURE__ */ u$1("div", { class: "header", children: [
      /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: handleExit, title: "Exit", children: /* @__PURE__ */ u$1(X, { size: 20 }) }),
      /* @__PURE__ */ u$1("h1", { children: routine.name }),
      /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate("edit/" + filename), title: "Edit", children: /* @__PURE__ */ u$1(Pencil, { size: 20 }) })
    ] }),
    done ? /* @__PURE__ */ u$1("div", { class: "runner-current", children: [
      /* @__PURE__ */ u$1("div", { class: "runner-label", children: "Complete!" }),
      /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: () => navigate(""), style: "margin-top:16px", children: "Back to Dashboard" })
    ] }) : /* @__PURE__ */ u$1(k$1, { children: [
      /* @__PURE__ */ u$1("div", { class: "runner-current", children: [
        /* @__PURE__ */ u$1("div", { class: "runner-label", children: showWarmup ? "Get Ready" : currentStep.label }),
        !running && timeLeft === 0 && currentStep.pause ? /* @__PURE__ */ u$1("div", { class: "runner-timer", style: "font-size:24px;color:var(--text2)", children: "Paused — tap play to continue" }) : /* @__PURE__ */ u$1("div", { class: "runner-timer", children: minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : seconds }),
        !showWarmup && /* @__PURE__ */ u$1("div", { class: "card-sub", children: [
          "Step ",
          currentIndex + 1,
          " of ",
          steps.length
        ] }),
        /* @__PURE__ */ u$1("div", { class: "runner-controls", children: [
          /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: handlePrev, title: "Previous", children: /* @__PURE__ */ u$1(SkipBack, { size: 20 }) }),
          /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: handlePlayPause, children: isActive ? /* @__PURE__ */ u$1(Pause, { size: 20 }) : /* @__PURE__ */ u$1(Play, { size: 20 }) }),
          /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: handleNext, title: "Next", children: /* @__PURE__ */ u$1(SkipForward, { size: 20 }) })
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "runner-steps", children: steps.map((s2, i2) => /* @__PURE__ */ u$1(
        "div",
        {
          class: `runner-step ${i2 === currentIndex && !showWarmup ? "active" : ""} ${i2 < currentIndex ? "done" : ""}`,
          children: [
            /* @__PURE__ */ u$1("span", { children: [
              s2.label,
              s2.pause ? " ||" : ""
            ] }),
            /* @__PURE__ */ u$1("span", { children: formatDuration(s2.duration) })
          ]
        },
        i2
      )) })
    ] })
  ] });
}
function History() {
  const [logs, setLogs] = d(() => loadHistory());
  const routineByName = (() => {
    const map = /* @__PURE__ */ new Map();
    for (const [filename, routine] of Object.entries(loadRoutines())) {
      if (!map.has(routine.name)) {
        map.set(routine.name, filename);
      }
    }
    return map;
  })();
  y(() => {
    const settings = loadSettings();
    if (!settings.githubToken || !settings.repo) return;
    pullHistory(settings.repo, settings.githubToken).then((updated) => {
      if (updated) setLogs(updated);
    }).catch(() => showToast("GitHub sync failed"));
  }, []);
  const handleDelete = (id) => {
    deleteSessionLog(id);
    setLogs(loadHistory());
  };
  return /* @__PURE__ */ u$1("div", { children: [
    /* @__PURE__ */ u$1("div", { class: "header", children: [
      /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate(""), title: "Back", children: /* @__PURE__ */ u$1(ArrowLeft, { size: 18 }) }),
      /* @__PURE__ */ u$1("h1", { children: "History" })
    ] }),
    logs.length === 0 ? /* @__PURE__ */ u$1("div", { class: "empty", children: "No sessions recorded yet." }) : logs.map((log) => {
      const filename = routineByName.get(log.routineName);
      return /* @__PURE__ */ u$1("div", { class: "card", children: /* @__PURE__ */ u$1("div", { class: "card-row", children: [
        /* @__PURE__ */ u$1("div", { children: [
          /* @__PURE__ */ u$1("div", { class: "card-title", children: log.routineName }),
          /* @__PURE__ */ u$1("div", { class: "card-sub", children: [
            formatDateTime(log.timestamp),
            " · ",
            formatDuration(log.durationSeconds)
          ] })
        ] }),
        /* @__PURE__ */ u$1("div", { style: "display:flex;gap:6px", children: [
          filename && /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate("edit/" + filename), title: "Edit", children: /* @__PURE__ */ u$1(Pencil, { size: 20 }) }),
          /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => {
            if (filename) navigate("run/" + filename);
          }, title: "Run again", children: /* @__PURE__ */ u$1(Play, { size: 20 }) }),
          /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => handleDelete(log.id), title: "Delete", style: "color:var(--danger)", children: /* @__PURE__ */ u$1(Delete, { size: 20 }) })
        ] })
      ] }) }, log.id);
    })
  ] });
}
const name$3 = "HIIT Workout";
const data$3 = [{ "label": "Warm up", "duration": 10, "unit": "s" }, { "label": "Circuit", "repeats": 3, "children": [{ "label": "Jumping jacks", "duration": 30 }, { "label": "Break", "duration": 15 }, { "label": "Push-ups", "duration": 15 }, { "label": "Break", "duration": 15 }, { "label": "Squats", "duration": 15 }, { "label": "Break", "duration": 15 }] }];
const __vite_glob_0_0 = {
  name: name$3,
  data: data$3
};
const name$2 = "Morning Stretch";
const data$2 = [{ "label": "Neck rolls", "duration": 30 }, { "label": "Shoulder stretch (left)", "duration": 30 }, { "label": "Shoulder stretch (right)", "duration": 30 }, { "label": "Standing forward fold", "duration": 45 }, { "label": "Quad stretch (left)", "duration": 30 }, { "label": "Quad stretch (right)", "duration": 30 }, { "label": "Cat-cow", "duration": 45 }, { "label": "Child's pose", "duration": 60 }];
const __vite_glob_0_1 = {
  name: name$2,
  data: data$2
};
const name$1 = "Pomodoro";
const data$1 = [{ "label": "Focus session", "repeats": 4, "children": [{ "label": "Work", "duration": 25, "unit": "m" }, { "label": "Short break", "duration": 5, "unit": "m" }] }, { "label": "Long break", "duration": 15, "unit": "m" }];
const __vite_glob_0_2 = {
  name: name$1,
  data: data$1
};
const name = "Tabata 4min";
const data = [{ "label": "Tabata", "repeats": 8, "children": [{ "label": "Work", "duration": 20 }, { "label": "Rest", "duration": 10 }] }];
const __vite_glob_0_3 = {
  name,
  data
};
const modules = /* @__PURE__ */ Object.assign({ "../../examples/routines/hiit-workout.json": __vite_glob_0_0, "../../examples/routines/morning-stretch.json": __vite_glob_0_1, "../../examples/routines/pomodoro.json": __vite_glob_0_2, "../../examples/routines/tabata.json": __vite_glob_0_3 });
function importExamples() {
  let imported = 0;
  const errors = [];
  for (const [path, data2] of Object.entries(modules)) {
    const filename = path.split("/").pop().replace(/\.json$/, "");
    if (!validateRoutine(data2)) {
      errors.push(filename);
      continue;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const routine = { ...data2, created: now, edited: now };
    saveRoutine(filename, routine);
    imported++;
  }
  return { imported, errors };
}
function Settings() {
  const [settings, setSettings] = d(() => loadSettings());
  const [repos, setRepos] = d([]);
  const [validating, setValidating] = d(false);
  const [tokenValid, setTokenValid] = d(null);
  const [showInfo, setShowInfo] = d(false);
  const [voices, setVoices] = d([]);
  const [tryText, setTryText] = d("Hello, this is a test");
  const [routineCount, setRoutineCount] = d(null);
  y(() => {
    const load = () => {
      if ("speechSynthesis" in window) {
        setVoices(speechSynthesis.getVoices());
      }
    };
    load();
    if ("speechSynthesis" in window) {
      speechSynthesis.addEventListener("voiceschanged", load);
      return () => speechSynthesis.removeEventListener("voiceschanged", load);
    }
  }, []);
  const langs = [...new Set(voices.map((v2) => v2.lang))].sort();
  const filteredVoices = settings.announceLang ? voices.filter((v2) => v2.lang === settings.announceLang) : voices;
  const update = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };
  const handleValidate = async () => {
    setValidating(true);
    setTokenValid(null);
    setRoutineCount(null);
    try {
      const ok = await validateToken(settings.githubToken);
      setTokenValid(ok);
      if (ok) {
        const list = await listRepos(settings.githubToken);
        setRepos(list);
      }
    } catch {
      setTokenValid(false);
      showToast("GitHub validation failed");
    } finally {
      setValidating(false);
    }
  };
  const handleCheckRepo = async () => {
    if (!settings.repo || !settings.githubToken) return;
    setValidating(true);
    setRoutineCount(null);
    try {
      const count = await countRemoteRoutines(settings.repo, settings.githubToken);
      setRoutineCount(count);
    } catch {
      showToast("Repository check failed");
    } finally {
      setValidating(false);
    }
  };
  const handleImportExamples = () => {
    const result = importExamples();
    if (result.imported > 0) {
      showToast(`Imported ${result.imported} example${result.imported !== 1 ? "s" : ""}`, "success");
    }
    if (result.errors.length > 0) {
      showToast(`Failed: ${result.errors.join(", ")}`);
    }
  };
  return /* @__PURE__ */ u$1("div", { children: [
    /* @__PURE__ */ u$1("div", { class: "header", children: [
      /* @__PURE__ */ u$1("button", { class: "btn-icon", onClick: () => navigate(""), title: "Back", children: /* @__PURE__ */ u$1(ArrowLeft, { size: 18 }) }),
      /* @__PURE__ */ u$1("h1", { children: "Settings" })
    ] }),
    /* @__PURE__ */ u$1("div", { class: "settings-section", children: [
      /* @__PURE__ */ u$1("div", { class: "settings-section-title", children: "GitHub" }),
      /* @__PURE__ */ u$1("div", { class: "field", children: [
        /* @__PURE__ */ u$1("label", { children: "Personal Access Token" }),
        /* @__PURE__ */ u$1("div", { class: "field-row", children: [
          /* @__PURE__ */ u$1(
            "input",
            {
              type: "password",
              autocomplete: "off",
              value: settings.githubToken,
              onInput: (e2) => update({ githubToken: e2.target.value }),
              placeholder: "ghp_..."
            }
          ),
          /* @__PURE__ */ u$1("button", { type: "button", class: "btn-primary", onClick: handleValidate, disabled: validating, children: validating ? "..." : "Check" }),
          /* @__PURE__ */ u$1("button", { type: "button", class: "btn-icon", onClick: () => setShowInfo((s2) => !s2), title: "Info", style: "flex-shrink:0", children: /* @__PURE__ */ u$1(Info, { size: 18 }) })
        ] }),
        showInfo && /* @__PURE__ */ u$1("div", { style: "font-size:13px;color:var(--text2);margin-top:6px;padding:8px 12px;background:var(--surface2);border-radius:var(--radius)", children: [
          /* @__PURE__ */ u$1("a", { href: "https://github.com/settings/personal-access-tokens/new", target: "_blank", rel: "noopener noreferrer", style: "color:var(--accent)", children: "Generate a token" }),
          " with “Contents” read-and-write permissions."
        ] }),
        tokenValid === true && /* @__PURE__ */ u$1("span", { style: "color:var(--success);font-size:13px", children: "Token valid" }),
        tokenValid === false && /* @__PURE__ */ u$1("span", { style: "color:var(--danger);font-size:13px", children: "Invalid token" })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "field", children: [
        /* @__PURE__ */ u$1("label", { children: "Repository" }),
        /* @__PURE__ */ u$1("div", { class: "field-row", children: [
          /* @__PURE__ */ u$1(
            "select",
            {
              value: settings.repo,
              onChange: (e2) => update({ repo: e2.target.value }),
              children: [
                /* @__PURE__ */ u$1("option", { value: "", children: "Select a repository" }),
                repos.length === 0 && settings.repo && /* @__PURE__ */ u$1("option", { value: settings.repo, children: settings.repo }),
                repos.map((r2) => /* @__PURE__ */ u$1("option", { value: r2.full_name, children: r2.full_name }, r2.full_name))
              ]
            }
          ),
          /* @__PURE__ */ u$1("button", { type: "button", class: "btn-primary", onClick: handleCheckRepo, disabled: validating || !settings.githubToken || !settings.repo, children: validating ? "..." : "Check" }),
          /* @__PURE__ */ u$1("button", { type: "button", class: "btn-icon", onClick: () => window.open(`https://github.com/${settings.repo}`, "_blank"), disabled: !settings.repo, title: "Open repository", style: "flex-shrink:0", children: /* @__PURE__ */ u$1(ExternalLink, { size: 18 }) })
        ] }),
        routineCount !== null && /* @__PURE__ */ u$1("span", { style: "font-size:13px;color:var(--success)", children: [
          "Found ",
          routineCount,
          " routine",
          routineCount !== 1 ? "s" : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ u$1("div", { class: "settings-section", children: [
      /* @__PURE__ */ u$1("div", { class: "settings-section-title", children: "General" }),
      /* @__PURE__ */ u$1("div", { class: "toggle-row", children: [
        /* @__PURE__ */ u$1("span", { children: "Import examples" }),
        /* @__PURE__ */ u$1("button", { type: "button", class: "btn-primary", onClick: handleImportExamples, children: "Import" })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "toggle-row", children: [
        /* @__PURE__ */ u$1("span", { children: "Prepare duration" }),
        /* @__PURE__ */ u$1("div", { style: "display:flex;align-items:center;gap:4px", children: /* @__PURE__ */ u$1("div", { class: "num-stepper", children: [
          /* @__PURE__ */ u$1("button", { class: "num-stepper-btn", type: "button", onClick: () => update({ warmupDuration: Math.max(0, settings.warmupDuration - 1) }), children: "-" }),
          /* @__PURE__ */ u$1(
            "input",
            {
              type: "number",
              class: "inline-input duration-input",
              value: settings.warmupDuration,
              onInput: (e2) => {
                const v2 = parseInt(e2.target.value);
                update({ warmupDuration: v2 >= 0 ? v2 : 0 });
              },
              min: "0"
            }
          ),
          /* @__PURE__ */ u$1("button", { class: "num-stepper-btn", type: "button", onClick: () => update({ warmupDuration: settings.warmupDuration + 1 }), children: "+" }),
          /* @__PURE__ */ u$1("span", { class: "num-stepper-suffix", children: "s" })
        ] }) })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "toggle-row", children: [
        /* @__PURE__ */ u$1("span", { children: "Countdown beeps" }),
        /* @__PURE__ */ u$1("label", { class: "toggle", children: [
          /* @__PURE__ */ u$1(
            "input",
            {
              type: "checkbox",
              checked: settings.enableBeeps,
              onChange: (e2) => update({ enableBeeps: e2.target.checked })
            }
          ),
          /* @__PURE__ */ u$1("span", { class: "toggle-slider" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ u$1("div", { class: "settings-section", children: [
      /* @__PURE__ */ u$1("div", { class: "settings-section-title", children: "Announcement" }),
      /* @__PURE__ */ u$1("div", { class: "toggle-row", children: [
        /* @__PURE__ */ u$1("span", { children: "Current Step" }),
        /* @__PURE__ */ u$1("label", { class: "toggle", children: [
          /* @__PURE__ */ u$1(
            "input",
            {
              type: "checkbox",
              checked: settings.announceCurrent,
              onChange: (e2) => update({ announceCurrent: e2.target.checked })
            }
          ),
          /* @__PURE__ */ u$1("span", { class: "toggle-slider" })
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "toggle-row", children: [
        /* @__PURE__ */ u$1("span", { children: "Next Step" }),
        /* @__PURE__ */ u$1("div", { style: "display:flex;align-items:center;gap:4px", children: [
          /* @__PURE__ */ u$1("div", { class: "num-stepper", children: [
            /* @__PURE__ */ u$1("button", { class: "num-stepper-btn", type: "button", onClick: () => {
              if (settings.announceNextSeconds > 1) update({ announceNextSeconds: settings.announceNextSeconds - 1 });
            }, children: "-" }),
            /* @__PURE__ */ u$1(
              "input",
              {
                type: "number",
                class: "inline-input duration-input",
                value: settings.announceNextSeconds,
                onInput: (e2) => {
                  const v2 = parseInt(e2.target.value);
                  if (v2 > 0) update({ announceNextSeconds: v2 });
                },
                min: "1"
              }
            ),
            /* @__PURE__ */ u$1("button", { class: "num-stepper-btn", type: "button", onClick: () => update({ announceNextSeconds: settings.announceNextSeconds + 1 }), children: "+" }),
            /* @__PURE__ */ u$1("span", { class: "num-stepper-suffix", children: "s" })
          ] }),
          /* @__PURE__ */ u$1("label", { class: "toggle", children: [
            /* @__PURE__ */ u$1(
              "input",
              {
                type: "checkbox",
                checked: settings.announceNext,
                onChange: (e2) => update({ announceNext: e2.target.checked })
              }
            ),
            /* @__PURE__ */ u$1("span", { class: "toggle-slider" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "toggle-row", children: [
        /* @__PURE__ */ u$1("span", { children: "Halfway" }),
        /* @__PURE__ */ u$1("label", { class: "toggle", children: [
          /* @__PURE__ */ u$1(
            "input",
            {
              type: "checkbox",
              checked: settings.announceHalfway,
              onChange: (e2) => update({ announceHalfway: e2.target.checked })
            }
          ),
          /* @__PURE__ */ u$1("span", { class: "toggle-slider" })
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "toggle-row", children: [
        /* @__PURE__ */ u$1("span", { children: "Completion" }),
        /* @__PURE__ */ u$1("label", { class: "toggle", children: [
          /* @__PURE__ */ u$1(
            "input",
            {
              type: "checkbox",
              checked: settings.announceCompletion,
              onChange: (e2) => update({ announceCompletion: e2.target.checked })
            }
          ),
          /* @__PURE__ */ u$1("span", { class: "toggle-slider" })
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "field", style: "margin-top:12px", children: [
        /* @__PURE__ */ u$1("label", { children: "Language" }),
        /* @__PURE__ */ u$1(
          "select",
          {
            value: settings.announceLang,
            onChange: (e2) => update({ announceLang: e2.target.value, announceVoiceURI: "" }),
            children: [
              /* @__PURE__ */ u$1("option", { value: "", children: "Default" }),
              langs.map((l2) => /* @__PURE__ */ u$1("option", { value: l2, children: l2 }, l2))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ u$1("div", { class: "field", children: [
        /* @__PURE__ */ u$1("label", { children: "Voice" }),
        /* @__PURE__ */ u$1(
          "select",
          {
            value: settings.announceVoiceURI,
            onChange: (e2) => update({ announceVoiceURI: e2.target.value }),
            children: [
              /* @__PURE__ */ u$1("option", { value: "", children: "Default" }),
              filteredVoices.map((v2) => /* @__PURE__ */ u$1("option", { value: v2.voiceURI, children: v2.name }, v2.voiceURI))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ u$1("div", { class: "field", children: [
        /* @__PURE__ */ u$1("label", { children: "Test" }),
        /* @__PURE__ */ u$1("div", { class: "field-row", children: [
          /* @__PURE__ */ u$1(
            "input",
            {
              value: tryText,
              onInput: (e2) => setTryText(e2.target.value),
              placeholder: "Type something to test..."
            }
          ),
          /* @__PURE__ */ u$1("button", { class: "btn-primary", onClick: () => {
            unlockAudio();
            speak(tryText, settings.announceLang, settings.announceVoiceURI);
          }, children: "Try" })
        ] })
      ] })
    ] })
  ] });
}
function parseHash(hash) {
  const safeDecode = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  const h2 = hash.replace(/^#\/?/, "");
  if (h2.startsWith("edit/")) return { view: "editor", filename: safeDecode(h2.slice(5)) };
  if (h2.startsWith("run/")) return { view: "runner", filename: safeDecode(h2.slice(4)) };
  if (h2 === "settings") return { view: "settings" };
  if (h2 === "history") return { view: "history" };
  return { view: "dashboard" };
}
function navigate(path) {
  window.location.hash = "#" + path;
}
function App() {
  const [route, setRoute] = d(() => parseHash(window.location.hash));
  y(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  switch (route.view) {
    case "settings":
      return /* @__PURE__ */ u$1(Settings, {});
    case "history":
      return /* @__PURE__ */ u$1(History, {});
    case "editor":
      return /* @__PURE__ */ u$1(Editor, { filename: route.filename });
    case "runner":
      return /* @__PURE__ */ u$1(Runner, { filename: route.filename });
    default:
      return /* @__PURE__ */ u$1(Dashboard, {});
  }
}
G(/* @__PURE__ */ u$1(App, {}), document.getElementById("app"));
