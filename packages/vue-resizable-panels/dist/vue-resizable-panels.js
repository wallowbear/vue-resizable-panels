import { defineComponent as K, inject as ze, ref as b, computed as M, watch as ve, onUnmounted as me, openBlock as Z, createBlock as J, resolveDynamicComponent as Q, normalizeClass as ee, normalizeStyle as ne, unref as G, withCtx as te, renderSlot as le, reactive as Ie, provide as De, onMounted as Re } from "vue";
const ae = Symbol("PanelGroupContext");
let fe = 0;
function ie(e) {
  return e || (fe++, `vue-resizable-panels:${fe}`);
}
const we = /* @__PURE__ */ K({
  __name: "Panel",
  props: {
    id: {},
    className: { default: "" },
    collapsedSize: { default: 0 },
    collapsible: { type: Boolean, default: !1 },
    defaultSize: {},
    maxSize: {},
    minSize: {},
    onCollapse: {},
    onExpand: {},
    onResize: {},
    order: {},
    style: {},
    tagName: { default: "div" }
  },
  emits: ["collapse", "expand", "resize"],
  setup(e, { expose: t, emit: n }) {
    const l = e, a = n, i = ze(ae);
    if (!i)
      throw new Error("Panel components must be rendered within a PanelGroup container");
    const {
      collapsePanel: s,
      expandPanel: r,
      getPanelSize: c,
      getPanelStyle: m,
      groupId: g,
      isPanelCollapsed: h,
      reevaluatePanelConstraints: y,
      registerPanel: C,
      resizePanel: S,
      unregisterPanel: w
    } = i, I = ie(l.id), p = b({
      callbacks: {
        onCollapse: () => a("collapse"),
        onExpand: () => a("expand"),
        onResize: (f, P) => a("resize", f, P)
      },
      constraints: {
        collapsedSize: l.collapsedSize,
        collapsible: l.collapsible,
        defaultSize: l.defaultSize,
        maxSize: l.maxSize,
        minSize: l.minSize
      },
      id: I,
      idIsFromProps: l.id !== void 0,
      order: l.order
    }), o = M(() => {
      const f = c(p.value);
      return console.log(`Panel ${I} size:`, f), f;
    }), d = M(() => h(p.value)), u = M(() => {
      const f = m(p.value, l.defaultSize);
      return console.log(`Panel ${I} style:`, f), {
        ...f,
        ...l.style
      };
    });
    return ve(
      () => ({
        collapsedSize: l.collapsedSize,
        collapsible: l.collapsible,
        maxSize: l.maxSize,
        minSize: l.minSize
      }),
      (f, P) => {
        const D = { ...p.value.constraints };
        p.value.constraints.collapsedSize = f.collapsedSize, p.value.constraints.collapsible = f.collapsible, p.value.constraints.maxSize = f.maxSize, p.value.constraints.minSize = f.minSize, (D.collapsedSize !== f.collapsedSize || D.collapsible !== f.collapsible || D.maxSize !== f.maxSize || D.minSize !== f.minSize) && y(p.value, D);
      },
      { deep: !0 }
    ), C(p.value), me(() => {
      w(p.value);
    }), t({
      collapse: () => s(p.value),
      expand: (f) => r(p.value, f),
      getId: () => I,
      getSize: () => c(p.value),
      isCollapsed: () => d.value,
      isExpanded: () => !h(p.value),
      resize: (f) => S(p.value, f)
    }), (f, P) => (Z(), J(Q(f.tagName), {
      class: ee(f.className),
      style: ne(u.value),
      "data-panel": !0,
      "data-panel-id": G(I),
      "data-panel-size": o.value,
      "data-panel-collapsible": f.collapsible || void 0,
      "data-panel-collapsed": d.value || void 0
    }, {
      default: te(() => [
        le(f.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-id", "data-panel-size", "data-panel-collapsible", "data-panel-collapsed"]));
  }
});
function O(e, t) {
  if (!e)
    throw new Error(t || "Assertion failed");
}
const he = 5;
function Le(e, t, n = he) {
  const l = parseFloat(e.toFixed(n)), a = parseFloat(t.toFixed(n));
  return l < a ? -1 : l > a ? 1 : 0;
}
function _(e, t, n = he) {
  return Le(e, t, n) === 0;
}
function Ne({
  panelConstraints: e,
  panelIndex: t,
  size: n
}) {
  const { collapsedSize: l = 0, collapsible: a, maxSize: i = 100, minSize: s = 0 } = e[t] ?? {};
  return a && _(n, l) ? l : n < s ? s : n > i ? i : n;
}
function W({
  panelConstraints: e,
  panelIndex: t,
  size: n
}) {
  return Ne({
    panelConstraints: e,
    panelIndex: t,
    size: n
  });
}
function He({
  delta: e,
  initialLayout: t,
  panelConstraints: n,
  pivotIndices: l,
  prevLayout: a,
  trigger: i
}) {
  if (_(e, 0))
    return t;
  const s = [...t], [r, c] = l;
  O(r != null, "Invalid first pivot index"), O(c != null, "Invalid second pivot index");
  let m = 0;
  {
    const g = t[r];
    O(g != null, `Previous layout not found for panel index ${r}`);
    const h = g + e, y = W({
      panelConstraints: n,
      panelIndex: r,
      size: h
    });
    _(g, y) || (m = y - g, s[r] = y);
  }
  {
    const g = t[c];
    O(g != null, `Previous layout not found for panel index ${c}`);
    const h = g - m, y = W({
      panelConstraints: n,
      panelIndex: c,
      size: h
    });
    s[c] = y;
  }
  return s;
}
function Me(e, t, n, l) {
  const a = l.getBoundingClientRect(), i = t === "horizontal", s = i ? e.clientX : e.clientY, r = i ? a.width : a.height;
  return (s - n) / r * 100;
}
function Ge({
  panelDataArray: e
}) {
  const t = Array(e.length), n = [];
  let l = 0;
  for (let a = 0; a < e.length; a++) {
    const i = e[a], { defaultSize: s } = i.constraints;
    s != null ? (t[a] = s, l += s) : n.push(a);
  }
  if (n.length > 0) {
    const a = 100 - l, i = Math.max(0, a / n.length);
    for (const s of n)
      t[s] = i;
  }
  return t;
}
function _e({
  defaultSize: e,
  dragState: t,
  layout: n,
  panelData: l,
  panelIndex: a,
  precision: i = 3
}) {
  const s = n[a];
  let r;
  return s == null ? r = e != null ? e.toPrecision(i) : "1" : l.length === 1 ? r = "1" : r = s.toPrecision(i), {
    flexBasis: 0,
    flexGrow: r,
    flexShrink: 1,
    // Without this, Panel sizes may be unintentionally overridden by their content
    overflow: "hidden",
    // Disable pointer events inside of a panel during resize
    // This avoid edge cases like nested iframes
    pointerEvents: t !== null ? "none" : void 0
  };
}
function ke(e, t, n) {
  const l = parseInt(t.split("-").pop() || "0"), a = l, i = l + 1;
  return [a, i];
}
function pe(e, t) {
  const n = e === "horizontal";
  return "clientX" in t && "clientY" in t ? n ? t.clientX : t.clientY : 0;
}
function Xe({
  layout: e,
  panelConstraints: t
}) {
  const n = [...e];
  let l = 0;
  for (let a = 0; a < n.length; a++) {
    const i = n[a], s = W({
      panelConstraints: t,
      panelIndex: a,
      size: i
    });
    n[a] = s, l += s;
  }
  if (!_(l, 100))
    for (let a = 0; a < n.length; a++)
      n[a] = n[a] / l * 100;
  return n;
}
function ge(e, t, n) {
  if (e.length !== t.length)
    return !1;
  for (let l = 0; l < e.length; l++)
    if (!_(e[l], t[l], n))
      return !1;
  return !0;
}
function oe(e) {
  if ("clientX" in e && "clientY" in e)
    return { x: e.clientX, y: e.clientY };
  if ("touches" in e && e.touches.length > 0) {
    const t = e.touches[0];
    return { x: t.clientX, y: t.clientY };
  }
  return { x: 0, y: 0 };
}
function Oe() {
  if (typeof matchMedia == "function")
    return matchMedia("(pointer:coarse)").matches ? "coarse" : "fine";
}
function $e(e, t, n = !1) {
  const l = n ? 0 : 1;
  return !(e.right < t.left + l || e.left > t.right - l || e.bottom < t.top + l || e.top > t.bottom - l);
}
function Ae(e, t) {
  if (e === t)
    return 0;
  if (e.contains(t))
    return -1;
  if (t.contains(e))
    return 1;
  const n = e.compareDocumentPosition(t);
  return n & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : n & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
}
const ye = 1, Pe = 2, Se = 4, xe = 8, Te = Oe() === "coarse";
let E = [], H = !1, L = /* @__PURE__ */ new Map(), B = /* @__PURE__ */ new Map();
const k = /* @__PURE__ */ new Set();
function Be(e, t, n, l, a) {
  const { ownerDocument: i } = t, s = {
    direction: n,
    element: t,
    hitAreaMargins: l,
    setResizeHandlerState: a
  }, r = L.get(i) ?? 0;
  return L.set(i, r + 1), k.add(s), A(), function() {
    B.delete(e), k.delete(s);
    const m = L.get(i) ?? 1;
    if (L.set(i, m - 1), A(), m === 1 && L.delete(i), E.includes(s)) {
      const g = E.indexOf(s);
      g >= 0 && E.splice(g, 1), re(), a("up", !0, null);
    }
  };
}
function Ye(e) {
  const { target: t } = e, { x: n, y: l } = oe(e);
  H = !0, se({ target: t, x: n, y: l }), A(), E.length > 0 && (T("down", e), e.preventDefault(), Ee(t) || e.stopImmediatePropagation());
}
function Y(e) {
  const { x: t, y: n } = oe(e);
  if (H && e.buttons === 0 && (H = !1, T("up", e)), !H) {
    const { target: l } = e;
    se({ target: l, x: t, y: n });
  }
  T("move", e), re(), E.length > 0 && e.preventDefault();
}
function U(e) {
  const { target: t } = e, { x: n, y: l } = oe(e);
  B.clear(), H = !1, E.length > 0 && (e.preventDefault(), Ee(t) || e.stopImmediatePropagation()), T("up", e), se({ target: t, x: n, y: l }), re(), A();
}
function Ee(e) {
  let t = e;
  for (; t; ) {
    if (t.hasAttribute("data-panel-resize-handle"))
      return !0;
    t = t.parentElement;
  }
  return !1;
}
function se({
  target: e,
  x: t,
  y: n
}) {
  E.splice(0);
  let l = null;
  (e instanceof HTMLElement || e instanceof SVGElement) && (l = e), k.forEach((a) => {
    const { element: i, hitAreaMargins: s } = a, r = i.getBoundingClientRect(), { bottom: c, left: m, right: g, top: h } = r, y = Te ? s.coarse : s.fine;
    if (t >= m - y && t <= g + y && n >= h - y && n <= c + y) {
      if (l !== null && document.contains(l) && i !== l && !i.contains(l) && !l.contains(i) && // Calculating stacking order has a cost, so we should avoid it if possible
      // That is why we only check potentially intersecting handles,
      // and why we skip if the event target is within the handle's DOM
      Ae(l, i) > 0) {
        let S = l, w = !1;
        for (; S && !S.contains(i); ) {
          if ($e(
            S.getBoundingClientRect(),
            r,
            !0
          )) {
            w = !0;
            break;
          }
          S = S.parentElement;
        }
        if (w)
          return;
      }
      E.push(a);
    }
  });
}
function F(e, t) {
  B.set(e, t);
}
function re() {
  let e = !1, t = !1;
  E.forEach((l) => {
    const { direction: a } = l;
    a === "horizontal" ? e = !0 : t = !0;
  });
  let n = 0;
  B.forEach((l) => {
    n |= l;
  }), e && t ? q("intersection", n) : e ? q("horizontal", n) : t ? q("vertical", n) : Fe();
}
let V = new AbortController();
function A() {
  V.abort(), V = new AbortController();
  const e = {
    capture: !0,
    signal: V.signal
  };
  k.size && (H ? (E.length > 0 && L.forEach((t, n) => {
    const { body: l } = n;
    t > 0 && (l.addEventListener("contextmenu", U, e), l.addEventListener("pointerleave", Y, e), l.addEventListener("pointermove", Y, e));
  }), window.addEventListener("pointerup", U, e), window.addEventListener("pointercancel", U, e)) : L.forEach((t, n) => {
    const { body: l } = n;
    t > 0 && (l.addEventListener("pointerdown", Ye, e), l.addEventListener("pointermove", Y, e));
  }));
}
function T(e, t) {
  k.forEach((n) => {
    const { setResizeHandlerState: l } = n, a = E.includes(n);
    l(e, a, t);
  });
}
let j = null, $ = -1, R = null;
function Ue(e, t) {
  if (t) {
    const n = (t & ye) !== 0, l = (t & Pe) !== 0, a = (t & Se) !== 0, i = (t & xe) !== 0;
    if (n)
      return a ? "se-resize" : i ? "ne-resize" : "e-resize";
    if (l)
      return a ? "sw-resize" : i ? "nw-resize" : "w-resize";
    if (a)
      return "s-resize";
    if (i)
      return "n-resize";
  }
  switch (e) {
    case "horizontal":
      return "ew-resize";
    case "intersection":
      return "move";
    case "vertical":
      return "ns-resize";
  }
}
function Fe() {
  R !== null && (document.head.removeChild(R), j = null, R = null, $ = -1);
}
function q(e, t) {
  var l, a;
  const n = Ue(e, t);
  j !== n && (j = n, R === null && (R = document.createElement("style"), document.head.appendChild(R)), $ >= 0 && ((l = R.sheet) == null || l.removeRule($)), $ = ((a = R.sheet) == null ? void 0 : a.insertRule(`*{cursor: ${n} !important;}`)) ?? -1);
}
const Ve = /* @__PURE__ */ K({
  __name: "PanelGroup",
  props: {
    id: {},
    direction: {},
    className: { default: "" },
    style: { default: () => ({}) },
    tagName: { default: "div" },
    keyboardResizeBy: { default: null },
    onLayout: {}
  },
  emits: ["layout"],
  setup(e, { emit: t }) {
    const n = e, l = t, a = ie(n.id), i = b(), s = b(null), r = b([]), c = b([]), m = b(0), g = M(() => ({
      display: "flex",
      flexDirection: n.direction === "horizontal" ? "row" : "column",
      height: "100%",
      overflow: "hidden",
      width: "100%",
      ...n.style
    })), h = (o) => {
      let d = !1;
      const u = i.value;
      return u && window.getComputedStyle(u, null).getPropertyValue("direction") === "rtl" && (d = !0), function(v) {
        v.preventDefault();
        const x = i.value;
        if (!x)
          return;
        const { initialLayout: N } = s.value ?? {}, ue = ke(
          a,
          o
        ), ce = pe(n.direction, v), { initialCursorPosition: f } = s.value || { initialCursorPosition: ce };
        let P = Me(
          { clientX: "clientX" in v ? v.clientX : 0, clientY: "clientY" in v ? v.clientY : 0 },
          n.direction,
          f,
          x
        );
        const D = n.direction === "horizontal";
        D && d && (P = -P);
        const be = c.value.map(
          (Ce) => Ce.constraints
        ), X = He({
          delta: P,
          initialLayout: N ?? r.value,
          panelConstraints: be,
          pivotIndices: ue,
          prevLayout: r.value,
          trigger: y(v) ? "keyboard" : "mouse-or-touch"
        }), de = !ge(r.value, X);
        (C(v) || S(v)) && m.value != P && (m.value = P, !de && P !== 0 ? D ? F(
          o,
          P < 0 ? ye : Pe
        ) : F(
          o,
          P < 0 ? Se : xe
        ) : F(o, 0)), de && (r.value = X, n.onLayout && n.onLayout(X), l("layout", X));
      };
    };
    function y(o) {
      return o.type === "keydown";
    }
    function C(o) {
      return o.type.startsWith("pointer");
    }
    function S(o) {
      return o.type.startsWith("mouse");
    }
    const p = Ie({
      collapsePanel: (o) => {
        console.log("collapsePanel", o);
      },
      get direction() {
        return n.direction;
      },
      get dragState() {
        return s.value;
      },
      expandPanel: (o, d) => {
        console.log("expandPanel", o, d);
      },
      getPanelSize: (o) => {
        const d = c.value.findIndex((u) => u.id === o.id);
        return r.value[d] || 0;
      },
      getPanelStyle: (o, d) => {
        const u = c.value.findIndex((z) => z.id === o.id);
        return _e({
          defaultSize: d,
          dragState: s.value,
          layout: r.value,
          panelData: c.value,
          panelIndex: u
        });
      },
      groupId: a,
      isPanelCollapsed: (o) => !1,
      isPanelExpanded: (o) => !p.isPanelCollapsed(o),
      reevaluatePanelConstraints: (o, d) => {
        console.log("reevaluatePanelConstraints", o, d);
      },
      registerPanel: (o) => {
        c.value.push(o), c.value.sort((z, v) => {
          const x = z.order, N = v.order;
          return x == null && N == null ? 0 : x == null ? -1 : N == null ? 1 : x - N;
        });
        const d = Ge({
          panelDataArray: c.value
        }), u = Xe({
          layout: d,
          panelConstraints: c.value.map(
            (z) => z.constraints
          )
        });
        ge(r.value, u) || (r.value = u, n.onLayout && n.onLayout(u), l("layout", u));
      },
      registerResizeHandle: h,
      resizePanel: (o, d) => {
        const u = c.value.findIndex((z) => z.id === o.id);
        u !== -1 && (r.value[u] = d);
      },
      startDragging: (o, d) => {
        if (!i.value)
          return;
        const u = i.value.querySelector(
          `[data-panel-resize-handle-id="${o}"]`
        );
        if (!u) {
          console.error(`Drag handle element not found for id "${o}"`);
          return;
        }
        const z = pe(
          n.direction,
          d
        );
        s.value = {
          dragHandleId: o,
          dragHandleRect: u.getBoundingClientRect(),
          initialCursorPosition: z,
          initialLayout: [...r.value]
        };
      },
      stopDragging: () => {
        s.value = null;
      },
      unregisterPanel: (o) => {
        const d = c.value.findIndex((u) => u.id === o.id);
        if (d !== -1) {
          if (c.value.splice(d, 1), r.value.splice(d, 1), c.value.length > 0) {
            const u = r.value.reduce((z, v) => z + v, 0);
            if (u < 100) {
              const z = (100 - u) / r.value.length;
              r.value = r.value.map((v) => v + z);
            }
          }
          n.onLayout && n.onLayout(r.value), l("layout", r.value);
        }
      },
      get panelGroupElement() {
        return i.value || null;
      }
    });
    return De(ae, p), (o, d) => (Z(), J(Q(o.tagName), {
      ref_key: "panelGroupElementRef",
      ref: i,
      class: ee(o.className),
      style: ne(g.value),
      "data-panel-group": !0,
      "data-panel-group-direction": o.direction,
      "data-panel-group-id": G(a)
    }, {
      default: te(() => [
        le(o.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-group-direction", "data-panel-group-id"]));
  }
}), qe = /* @__PURE__ */ K({
  __name: "PanelResizeHandle",
  props: {
    id: {},
    className: { default: "" },
    disabled: { type: Boolean, default: !1 },
    style: { default: () => ({}) },
    tabIndex: { default: 0 },
    tagName: { default: "div" },
    hitAreaMargins: { default: () => ({ coarse: 15, fine: 5 }) }
  },
  emits: ["blur", "focus", "dragging", "pointerDown", "pointerUp", "click"],
  setup(e, { emit: t }) {
    const n = e, l = t, a = ze(ae);
    if (!a)
      throw new Error("PanelResizeHandle components must be rendered within a PanelGroup container");
    const {
      direction: i,
      groupId: s,
      startDragging: r,
      stopDragging: c
    } = a, m = b(), g = ie(n.id), h = b("inactive"), y = b(!1), C = b(null), S = M(() => ({
      touchAction: "none",
      userSelect: "none",
      ...n.style
    })), w = () => {
      y.value = !1, l("blur");
    }, I = () => {
      y.value = !0, l("focus");
    }, p = (u, z, v) => {
      if (!z) {
        h.value = "inactive";
        return;
      }
      let x = !1;
      switch (u) {
        case "down": {
          h.value = "drag", x = !1, v && r(g, v), l("dragging", !0), l("pointerDown");
          break;
        }
        case "move": {
          x = !0, h.value !== "drag" && (h.value = "hover");
          break;
        }
        case "up": {
          h.value = "hover", c(), l("dragging", !1), l("pointerUp"), x || l("click");
          break;
        }
      }
    }, o = () => {
      if (n.disabled || !m.value)
        return;
      const u = Be(
        g,
        m.value,
        i,
        n.hitAreaMargins,
        p
      );
      C.value = u;
    }, d = () => {
      C.value && (C.value(), C.value = null);
    };
    return ve(
      () => n.disabled,
      (u) => {
        u ? d() : o();
      }
    ), Re(() => {
      o();
    }), me(() => {
      d();
    }), (u, z) => (Z(), J(Q(u.tagName), {
      ref_key: "elementRef",
      ref: m,
      class: ee(u.className),
      style: ne(S.value),
      tabindex: u.disabled ? void 0 : u.tabIndex,
      "data-panel-resize-handle": !0,
      "data-panel-resize-handle-id": G(g),
      "data-panel-resize-handle-enabled": !u.disabled || void 0,
      "data-panel-resize-handle-disabled": u.disabled || void 0,
      "data-panel-group-direction": G(i),
      "data-panel-group-id": G(s),
      "data-panel-resize-handle-state": h.value,
      role: "separator",
      onBlur: w,
      onFocus: I
    }, {
      default: te(() => [
        le(u.$slots, "default")
      ]),
      _: 3
    }, 40, ["class", "style", "tabindex", "data-panel-resize-handle-id", "data-panel-resize-handle-enabled", "data-panel-resize-handle-disabled", "data-panel-group-direction", "data-panel-group-id", "data-panel-resize-handle-state"]));
  }
});
function je(e, t) {
  if (e.length !== t.length)
    return !1;
  for (let n = 0; n < e.length; n++)
    if (e[n] !== t[n])
      return !1;
  return !0;
}
const Ke = {
  Panel: we,
  PanelGroup: Ve,
  PanelResizeHandle: qe
};
export {
  we as Panel,
  Ve as PanelGroup,
  qe as PanelResizeHandle,
  je as areEqual,
  O as assert,
  Ke as default,
  Le as fuzzyCompareNumbers,
  _ as fuzzyNumbersEqual
};
