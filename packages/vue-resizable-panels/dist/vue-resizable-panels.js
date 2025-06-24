import { defineComponent as G, inject as K, ref as L, computed as M, watch as Q, onMounted as O, onUnmounted as W, openBlock as B, createBlock as k, resolveDynamicComponent as F, normalizeClass as _, normalizeStyle as H, unref as w, withCtx as q, renderSlot as U, reactive as T, provide as V } from "vue";
const X = Symbol("PanelGroupContext");
let j = 0;
function Y(l) {
  return l || (j++, `vue-resizable-panels:${j}`);
}
const ce = /* @__PURE__ */ G({
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
  setup(l, { expose: t, emit: e }) {
    const a = l, o = e, d = K(X);
    if (!d)
      throw new Error("Panel components must be rendered within a PanelGroup container");
    const {
      collapsePanel: i,
      expandPanel: r,
      getPanelSize: p,
      getPanelStyle: P,
      // groupId,
      isPanelCollapsed: h,
      reevaluatePanelConstraints: v,
      registerPanel: u,
      resizePanel: S,
      unregisterPanel: z
    } = d, f = Y(a.id), s = L({
      callbacks: {
        onCollapse: () => o("collapse"),
        onExpand: () => o("expand"),
        onResize: (m, R) => o("resize", m, R)
      },
      constraints: {
        collapsedSize: a.collapsedSize,
        collapsible: a.collapsible,
        defaultSize: a.defaultSize,
        maxSize: a.maxSize,
        minSize: a.minSize
      },
      id: f,
      idIsFromProps: a.id !== void 0,
      order: a.order
    }), n = M(() => {
      const m = p(s.value);
      return console.log(`Panel ${f} size:`, m), m;
    }), c = M(() => h(s.value)), g = M(() => {
      const m = P(s.value, a.defaultSize);
      return console.log(`Panel ${f} style:`, m), {
        ...m,
        ...a.style
      };
    });
    return Q(
      () => ({
        collapsedSize: a.collapsedSize,
        collapsible: a.collapsible,
        maxSize: a.maxSize,
        minSize: a.minSize
      }),
      (m) => {
        const R = { ...s.value.constraints };
        s.value.constraints.collapsedSize = m.collapsedSize, s.value.constraints.collapsible = m.collapsible, s.value.constraints.maxSize = m.maxSize, s.value.constraints.minSize = m.minSize, (R.collapsedSize !== m.collapsedSize || R.collapsible !== m.collapsible || R.maxSize !== m.maxSize || R.minSize !== m.minSize) && v(s.value, R);
      },
      { deep: !0 }
    ), O(() => {
      u(s.value);
    }), W(() => {
      z(s.value);
    }), t({
      collapse: () => i(s.value),
      expand: (m) => r(s.value, m),
      getId: () => f,
      getSize: () => p(s.value),
      isCollapsed: () => c.value,
      isExpanded: () => !h(s.value),
      resize: (m) => S(s.value, m)
    }), (m, R) => (B(), k(F(m.tagName), {
      class: _(m.className),
      style: H(g.value),
      "data-panel": !0,
      "data-panel-id": w(f),
      "data-panel-size": n.value,
      "data-panel-collapsible": m.collapsible || void 0,
      "data-panel-collapsed": c.value || void 0
    }, {
      default: q(() => [
        U(m.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-id", "data-panel-size", "data-panel-collapsible", "data-panel-collapsed"]));
  }
});
function E(l, t) {
  if (!l)
    throw new Error(t || "Assertion failed");
}
const J = 5;
function $(l, t, e = J) {
  const a = parseFloat(l.toFixed(e)), o = parseFloat(t.toFixed(e));
  return a < o ? -1 : a > o ? 1 : 0;
}
function b(l, t, e = J) {
  return $(l, t, e) === 0;
}
function N(l, t) {
  if (l.length !== t.length)
    return !1;
  for (let e = 0; e < l.length; e++)
    if (!b(l[e], t[e]))
      return !1;
  return !0;
}
function Z({
  panelConstraints: l,
  panelIndex: t,
  size: e
}) {
  const { collapsedSize: a = 0, collapsible: o, maxSize: d = 100, minSize: i = 0 } = l[t] ?? {};
  return o && b(e, a) ? a : e < i ? i : e > d ? d : e;
}
function C({
  panelConstraints: l,
  panelIndex: t,
  size: e
}) {
  return Z({
    panelConstraints: l,
    panelIndex: t,
    size: e
  });
}
function ee({
  delta: l,
  initialLayout: t,
  panelConstraints: e,
  pivotIndices: a,
  prevLayout: o,
  trigger: d
}) {
  if (b(l, 0))
    return t;
  const i = [...t], [r, p] = a;
  E(r != null, "Invalid first pivot index"), E(p != null, "Invalid second pivot index");
  let P = 0;
  if (d === "keyboard") {
    {
      const v = l < 0 ? p : r, u = e[v];
      E(
        u,
        `Panel constraints not found for index ${v}`
      );
      const {
        collapsedSize: S = 0,
        collapsible: z,
        minSize: f = 0
      } = u;
      if (z) {
        const s = t[v];
        if (E(
          s != null,
          `Previous layout not found for panel index ${v}`
        ), b(s, S)) {
          const n = f - s;
          $(n, Math.abs(l)) > 0 && (l = l < 0 ? 0 - n : n);
        }
      }
    }
    {
      const v = l < 0 ? r : p, u = e[v];
      E(
        u,
        `No panel constraints found for index ${v}`
      );
      const {
        collapsedSize: S = 0,
        collapsible: z,
        minSize: f = 0
      } = u;
      if (z) {
        const s = t[v];
        if (E(
          s != null,
          `Previous layout not found for panel index ${v}`
        ), b(s, f)) {
          const n = s - S;
          $(n, Math.abs(l)) > 0 && (l = l < 0 ? 0 - n : n);
        }
      }
    }
  }
  {
    const v = l < 0 ? 1 : -1;
    let u = l < 0 ? p : r, S = 0;
    for (; ; ) {
      const f = t[u];
      E(
        f != null,
        `Previous layout not found for panel index ${u}`
      );
      const n = C({
        panelConstraints: e,
        panelIndex: u,
        size: 100
      }) - f;
      if (S += n, u += v, u < 0 || u >= e.length)
        break;
    }
    const z = Math.min(Math.abs(l), Math.abs(S));
    l = l < 0 ? 0 - z : z;
  }
  {
    let u = l < 0 ? r : p;
    for (; u >= 0 && u < e.length; ) {
      const S = Math.abs(l) - Math.abs(P), z = t[u];
      E(
        z != null,
        `Previous layout not found for panel index ${u}`
      );
      const f = z - S, s = C({
        panelConstraints: e,
        panelIndex: u,
        size: f
      });
      if (!b(z, s) && (P += z - s, i[u] = s, P.toPrecision(3).localeCompare(Math.abs(l).toPrecision(3), void 0, {
        numeric: !0
      }) >= 0))
        break;
      l < 0 ? u-- : u++;
    }
  }
  if (N(o, i))
    return o;
  {
    const v = l < 0 ? p : r, u = t[v];
    E(
      u != null,
      `Previous layout not found for panel index ${v}`
    );
    const S = u + P, z = C({
      panelConstraints: e,
      panelIndex: v,
      size: S
    });
    if (i[v] = z, !b(z, S)) {
      let f = S - z, n = l < 0 ? p : r;
      for (; n >= 0 && n < e.length; ) {
        const c = i[n];
        E(
          c != null,
          `Previous layout not found for panel index ${n}`
        );
        const g = c + f, x = C({
          panelConstraints: e,
          panelIndex: n,
          size: g
        });
        if (b(c, x) || (f -= x - c, i[n] = x), b(f, 0))
          break;
        l > 0 ? n-- : n++;
      }
    }
  }
  const h = i.reduce((v, u) => u + v, 0);
  return b(h, 100) ? i : o;
}
function ne(l, t, e, a) {
  const o = a.getBoundingClientRect(), d = t === "horizontal", i = d ? l.clientX : l.clientY, r = d ? o.width : o.height;
  return (i - e) / r * 100;
}
function le({
  panelDataArray: l
}) {
  const t = Array(l.length), e = [];
  let a = 0;
  for (let o = 0; o < l.length; o++) {
    const d = l[o], { defaultSize: i } = d.constraints;
    i != null ? (t[o] = i, a += i) : e.push(o);
  }
  if (e.length > 0) {
    const o = 100 - a, d = Math.max(0, o / e.length);
    for (const i of e)
      t[i] = d;
  }
  return t;
}
function te({
  defaultSize: l,
  dragState: t,
  layout: e,
  panelData: a,
  panelIndex: o,
  precision: d = 3
}) {
  const i = e[o];
  let r;
  return i == null ? r = l != null ? l.toPrecision(d) : "1" : a.length === 1 ? r = "1" : r = i.toPrecision(d), {
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
function oe(l, t = document) {
  return Array.from(
    t.querySelectorAll(
      `[data-panel-resize-handle-id][data-panel-group-id="${l}"]`
    )
  );
}
function ae(l, t, e = document) {
  const o = oe(l, e).findIndex(
    (d) => d.getAttribute("data-panel-resize-handle-id") === t
  );
  return o >= 0 ? o : null;
}
function ie(l, t, e) {
  const a = ae(
    l,
    t,
    e
  );
  return a != null ? [a, a + 1] : [-1, -1];
}
function se(l, t) {
  const e = l === "horizontal";
  return "clientX" in t && "clientY" in t ? e ? t.clientX : t.clientY : 0;
}
function re({
  layout: l,
  panelConstraints: t
}) {
  const e = [...l];
  let a = 0;
  for (let o = 0; o < e.length; o++) {
    const d = e[o], i = C({
      panelConstraints: t,
      panelIndex: o,
      size: d
    });
    e[o] = i, a += i;
  }
  if (!b(a, 100))
    for (let o = 0; o < e.length; o++)
      e[o] = e[o] / a * 100;
  return e;
}
const pe = /* @__PURE__ */ G({
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
  setup(l, { emit: t }) {
    const e = l, a = t, o = Y(e.id), d = L(), i = L(null), r = L([]), p = L([]), P = M(() => ({
      display: "flex",
      flexDirection: e.direction === "horizontal" ? "row" : "column",
      height: "100%",
      overflow: "hidden",
      width: "100%",
      ...e.style
    })), h = (n, c) => {
      if (console.log("Starting drag for handle:", n), !d.value)
        return;
      const g = d.value.querySelector(
        `[data-panel-resize-handle-id="${n}"]`
      );
      if (!g) {
        console.error(`Drag handle element not found for id "${n}"`);
        return;
      }
      const x = se(
        e.direction,
        c
      );
      i.value = {
        dragHandleId: n,
        dragHandleRect: g.getBoundingClientRect(),
        initialCursorPosition: x,
        initialLayout: [...r.value]
      }, console.log("Drag state set:", i.value), S();
    }, v = () => {
      i.value = null;
    }, u = (n) => {
      if (!i.value || !d.value)
        return;
      console.log("Mouse move during drag");
      const { initialCursorPosition: c, initialLayout: g, dragHandleId: x } = i.value, I = ne(
        { clientX: n.clientX, clientY: n.clientY },
        e.direction,
        c,
        d.value
      );
      console.log("Delta percentage:", I);
      const D = ie(
        o,
        x,
        d.value
      );
      if (console.log("Pivot indices:", D), D[0] === -1 || D[1] === -1) {
        console.warn("无法找到有效的panel索引，停止拖拽处理");
        return;
      }
      const y = ee({
        delta: I,
        initialLayout: g,
        panelConstraints: p.value.map((A) => A.constraints),
        pivotIndices: D,
        prevLayout: r.value,
        trigger: "mouse-or-touch"
      });
      console.log("Next layout:", y), N(r.value, y) || (r.value = y, e.onLayout && e.onLayout(y), a("layout", y));
    }, S = () => {
      console.log("🎯 Adding global event listeners"), document.addEventListener("mousemove", u), document.addEventListener("mouseup", f), console.log("✅ Global event listeners added");
    }, z = () => {
      console.log("🧹 Removing global event listeners"), document.removeEventListener("mousemove", u), document.removeEventListener("mouseup", f), console.log("✅ Global event listeners removed");
    }, f = () => {
      console.log("🛑 Stopping drag and cleanup"), v(), z();
    }, s = T({
      collapsePanel: (n) => {
        console.log("collapsePanel", n);
      },
      get direction() {
        return e.direction;
      },
      get dragState() {
        return i.value;
      },
      expandPanel: (n, c) => {
        console.log("expandPanel", n, c);
      },
      getPanelSize: (n) => {
        const c = p.value.findIndex((g) => g.id === n.id);
        return r.value[c] || 0;
      },
      getPanelStyle: (n, c) => {
        const g = p.value.findIndex((x) => x.id === n.id);
        return te({
          defaultSize: c,
          dragState: i.value,
          layout: r.value,
          panelData: p.value,
          panelIndex: g
        });
      },
      groupId: o,
      handleResizeDrag: (n, c) => {
        if (!i.value) {
          h(n, c);
          return;
        }
        u(c);
      },
      isPanelCollapsed: (n) => !1,
      isPanelExpanded: (n) => !s.isPanelCollapsed(n),
      reevaluatePanelConstraints: (n, c) => {
        console.log("reevaluatePanelConstraints", n, c);
      },
      registerPanel: (n) => {
        p.value.push(n), p.value.sort((x, I) => {
          const D = x.order, y = I.order;
          return D == null && y == null ? 0 : D == null ? -1 : y == null ? 1 : D - y;
        });
        const c = le({
          panelDataArray: p.value
        }), g = re({
          layout: c,
          panelConstraints: p.value.map(
            (x) => x.constraints
          )
        });
        N(r.value, g) || (r.value = g, e.onLayout && e.onLayout(g), a("layout", g));
      },
      resizePanel: (n, c) => {
        const g = p.value.findIndex((x) => x.id === n.id);
        g !== -1 && (r.value[g] = c);
      },
      startDragging: h,
      stopDragging: f,
      unregisterPanel: (n) => {
        const c = p.value.findIndex((g) => g.id === n.id);
        if (c !== -1) {
          if (p.value.splice(c, 1), r.value.splice(c, 1), p.value.length > 0) {
            const g = r.value.reduce((x, I) => x + I, 0);
            if (g < 100) {
              const x = (100 - g) / r.value.length;
              r.value = r.value.map((I) => I + x);
            }
          }
          e.onLayout && e.onLayout(r.value), a("layout", r.value);
        }
      },
      get panelGroupElement() {
        return d.value || null;
      }
    });
    return V(X, s), (n, c) => (B(), k(F(n.tagName), {
      ref_key: "panelGroupElementRef",
      ref: d,
      class: _(n.className),
      style: H(P.value),
      "data-panel-group": !0,
      "data-panel-group-direction": n.direction,
      "data-panel-group-id": w(o)
    }, {
      default: q(() => [
        U(n.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-group-direction", "data-panel-group-id"]));
  }
}), fe = /* @__PURE__ */ G({
  __name: "PanelResizeHandle",
  props: {
    id: {},
    className: { default: "" },
    disabled: { type: Boolean, default: !1 },
    style: { default: () => ({}) },
    tabIndex: { default: 0 },
    tagName: { default: "div" }
  },
  emits: ["blur", "focus", "dragging", "pointerDown", "pointerUp", "click"],
  setup(l, { emit: t }) {
    const e = l, a = t, o = K(X);
    if (!o)
      throw new Error("PanelResizeHandle components must be rendered within a PanelGroup container");
    const {
      direction: d,
      groupId: i
    } = o, r = L(), p = Y(e.id), P = L(!1), h = L(!1), v = M(() => ({
      touchAction: "none",
      userSelect: "none",
      cursor: d === "horizontal" ? "col-resize" : "row-resize",
      ...e.style
    })), u = () => {
      P.value = !1, a("blur");
    }, S = () => {
      P.value = !0, a("focus");
    }, z = (n) => {
      e.disabled || (console.log("🖱️ Mouse down on resize handle:", p), n.preventDefault(), h.value = !0, o.startDragging && o.startDragging(p, n), document.addEventListener("mousemove", f, { passive: !1 }), document.addEventListener("mouseup", s, { passive: !1 }), console.log("🎯 Started dragging, added global listeners"), a("pointerDown"), a("dragging", !0));
    }, f = (n) => {
      h.value && (console.log("🖱️ Mouse move during drag"), n.preventDefault(), o.handleResizeDrag && o.handleResizeDrag(p, n));
    }, s = (n) => {
      h.value && (console.log("🖱️ Mouse up, ending drag"), n.preventDefault(), h.value = !1, document.removeEventListener("mousemove", f), document.removeEventListener("mouseup", s), console.log("🧹 Ended dragging, removed global listeners"), a("pointerUp"), a("dragging", !1));
    };
    return O(() => {
      console.log("PanelResizeHandle mounted:", p);
    }), W(() => {
      h.value && (document.removeEventListener("mousemove", f), document.removeEventListener("mouseup", s));
    }), (n, c) => (B(), k(F(n.tagName), {
      ref_key: "elementRef",
      ref: r,
      class: _(n.className),
      style: H(v.value),
      tabindex: n.disabled ? void 0 : n.tabIndex,
      "data-panel-resize-handle": !0,
      "data-panel-resize-handle-id": w(p),
      "data-panel-resize-handle-enabled": !n.disabled || void 0,
      "data-panel-resize-handle-disabled": n.disabled || void 0,
      "data-panel-group-direction": w(d),
      "data-panel-group-id": w(i),
      role: "separator",
      onBlur: u,
      onFocus: S,
      onMousedown: z
    }, {
      default: q(() => [
        U(n.$slots, "default")
      ]),
      _: 3
    }, 40, ["class", "style", "tabindex", "data-panel-resize-handle-id", "data-panel-resize-handle-enabled", "data-panel-resize-handle-disabled", "data-panel-group-direction", "data-panel-group-id"]));
  }
});
function ve(l, t) {
  if (l.length !== t.length)
    return !1;
  for (let e = 0; e < l.length; e++)
    if (l[e] !== t[e])
      return !1;
  return !0;
}
export {
  ce as Panel,
  pe as PanelGroup,
  fe as PanelResizeHandle,
  ve as areEqual,
  E as assert,
  $ as fuzzyCompareNumbers,
  b as fuzzyNumbersEqual
};
