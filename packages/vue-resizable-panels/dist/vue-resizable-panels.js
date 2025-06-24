import { defineComponent as I, inject as U, ref as m, computed as y, watch as A, onMounted as j, onUnmounted as K, openBlock as E, createBlock as R, resolveDynamicComponent as N, normalizeClass as w, normalizeStyle as G, unref as D, withCtx as _, renderSlot as H, reactive as W, provide as J } from "vue";
const B = Symbol("PanelGroupContext");
let q = 0;
function F(t) {
  return t || (q++, `vue-resizable-panels:${q}`);
}
const L = /* @__PURE__ */ I({
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
  setup(t, { expose: i, emit: n }) {
    const a = t, r = n, f = U(B);
    if (!f)
      throw new Error("Panel components must be rendered within a PanelGroup container");
    const {
      collapsePanel: p,
      expandPanel: s,
      getPanelSize: z,
      getPanelStyle: g,
      groupId: e,
      isPanelCollapsed: l,
      reevaluatePanelConstraints: d,
      registerPanel: v,
      resizePanel: b,
      unregisterPanel: C
    } = f, P = F(a.id), o = m({
      callbacks: {
        onCollapse: () => r("collapse"),
        onExpand: () => r("expand"),
        onResize: (u, h) => r("resize", u, h)
      },
      constraints: {
        collapsedSize: a.collapsedSize,
        collapsible: a.collapsible,
        defaultSize: a.defaultSize,
        maxSize: a.maxSize,
        minSize: a.minSize
      },
      id: P,
      idIsFromProps: a.id !== void 0,
      order: a.order
    }), c = y(() => z(o.value)), S = y(() => l(o.value)), O = y(() => ({
      ...g(o.value, a.defaultSize),
      ...a.style
    }));
    return A(
      () => [a.collapsedSize, a.collapsible, a.maxSize, a.minSize],
      ([u, h, k, $], [te, se, oe, ie]) => {
        const x = { ...o.value.constraints };
        o.value.constraints.collapsedSize = u, o.value.constraints.collapsible = h, o.value.constraints.maxSize = k, o.value.constraints.minSize = $, (x.collapsedSize !== u || x.collapsible !== h || x.maxSize !== k || x.minSize !== $) && d(o.value, x);
      },
      { deep: !0 }
    ), j(() => {
      v(o.value);
    }), K(() => {
      C(o.value);
    }), i({
      collapse: () => p(o.value),
      expand: (u) => s(o.value, u),
      getId: () => P,
      getSize: () => z(o.value),
      isCollapsed: () => S.value,
      isExpanded: () => !l(o.value),
      resize: (u) => b(o.value, u)
    }), (u, h) => (E(), R(N(u.tagName), {
      class: w(u.className),
      style: G(O.value),
      "data-panel": !0,
      "data-panel-id": D(P),
      "data-panel-size": c.value,
      "data-panel-collapsible": u.collapsible || void 0,
      "data-panel-collapsed": S.value || void 0
    }, {
      default: _(() => [
        H(u.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-id", "data-panel-size", "data-panel-collapsible", "data-panel-collapsed"]));
  }
});
function Q({
  defaultSize: t,
  dragState: i,
  layout: n,
  panelData: a,
  panelIndex: r,
  precision: f = 3
}) {
  const p = n[r];
  let s;
  return p == null ? s = t != null ? t.toPrecision(f) : "1" : a.length === 1 ? s = "1" : s = p.toPrecision(f), {
    flexBasis: 0,
    flexGrow: s,
    flexShrink: 1,
    // Without this, Panel sizes may be unintentionally overridden by their content
    overflow: "hidden",
    // Disable pointer events inside of a panel during resize
    // This avoid edge cases like nested iframes
    pointerEvents: i !== null ? "none" : void 0
  };
}
const T = /* @__PURE__ */ I({
  __name: "PanelGroup",
  props: {
    id: {},
    className: { default: "" },
    direction: {},
    style: { default: () => ({}) },
    tagName: { default: "div" },
    autoSaveId: {}
  },
  emits: ["layout"],
  setup(t, { emit: i }) {
    const n = t, a = F(n.id), r = m(), f = m(null), p = m([]), s = m([]), z = y(() => ({
      display: "flex",
      flexDirection: n.direction === "horizontal" ? "row" : "column",
      height: "100%",
      overflow: "hidden",
      width: "100%",
      ...n.style
    })), g = W({
      collapsePanel: (e) => {
        console.log("collapsePanel", e);
      },
      direction: n.direction,
      dragState: f.value,
      expandPanel: (e, l) => {
        console.log("expandPanel", e, l);
      },
      getPanelSize: (e) => {
        const l = s.value.findIndex((d) => d.id === e.id);
        return p.value[l] || 0;
      },
      getPanelStyle: (e, l) => {
        const d = s.value.findIndex((v) => v.id === e.id);
        return Q({
          defaultSize: l,
          dragState: f.value,
          layout: p.value,
          panelData: s.value,
          panelIndex: d
        });
      },
      groupId: a,
      isPanelCollapsed: (e) => !1,
      isPanelExpanded: (e) => !g.isPanelCollapsed(e),
      reevaluatePanelConstraints: (e, l) => {
        console.log("reevaluatePanelConstraints", e, l);
      },
      registerPanel: (e) => {
        if (s.value.push(e), p.value.length === 0) {
          const l = 100 / s.value.length;
          p.value = s.value.map(() => l);
        }
      },
      registerResizeHandle: (e) => (l) => {
        console.log("resize handle event", e, l);
      },
      resizePanel: (e, l) => {
        const d = s.value.findIndex((v) => v.id === e.id);
        d !== -1 && (p.value[d] = l);
      },
      startDragging: (e, l) => {
        console.log("startDragging", e, l);
      },
      stopDragging: () => {
        f.value = null;
      },
      unregisterPanel: (e) => {
        const l = s.value.findIndex((d) => d.id === e.id);
        l !== -1 && (s.value.splice(l, 1), p.value.splice(l, 1));
      },
      panelGroupElement: r.value || null
    });
    return J(B, g), (e, l) => (E(), R(N(e.tagName), {
      ref_key: "panelGroupElementRef",
      ref: r,
      class: w(e.className),
      style: G(z.value),
      "data-panel-group": !0,
      "data-panel-group-id": D(a),
      "data-panel-group-direction": e.direction
    }, {
      default: _(() => [
        H(e.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-group-id", "data-panel-group-direction"]));
  }
}), V = /* @__PURE__ */ I({
  __name: "PanelResizeHandle",
  props: {
    id: {},
    className: { default: "" },
    disabled: { type: Boolean, default: !1 },
    style: { default: () => ({}) },
    tabIndex: { default: 0 },
    tagName: { default: "div" }
  },
  emits: ["blur", "focus", "dragging", "pointerDown", "pointerUp"],
  setup(t, { emit: i }) {
    const n = t, a = i, r = U(B);
    if (!r)
      throw new Error("PanelResizeHandle components must be rendered within a PanelGroup container");
    const {
      direction: f,
      groupId: p,
      registerResizeHandle: s,
      startDragging: z,
      stopDragging: g,
      panelGroupElement: e
    } = r, l = m(), d = F(n.id), v = m(null), b = m(!1), C = y(() => ({
      ...n.style,
      cursor: f === "horizontal" ? "col-resize" : "row-resize"
    })), P = () => {
      b.value = !1, a("blur");
    }, o = () => {
      b.value = !0, a("focus");
    };
    return A(
      () => n.disabled,
      (c) => {
        if (c)
          v.value = null;
        else {
          const S = s(d);
          v.value = S;
        }
      },
      { immediate: !0 }
    ), j(() => {
      if (!n.disabled) {
        const c = s(d);
        v.value = c;
      }
    }), K(() => {
      v.value = null;
    }), (c, S) => (E(), R(N(c.tagName), {
      ref_key: "elementRef",
      ref: l,
      class: w(c.className),
      style: G(C.value),
      tabindex: c.disabled ? void 0 : c.tabIndex,
      "data-panel-resize-handle": !0,
      "data-panel-resize-handle-id": D(d),
      "data-panel-resize-handle-enabled": !c.disabled || void 0,
      "data-panel-resize-handle-disabled": c.disabled || void 0,
      onBlur: P,
      onFocus: o
    }, {
      default: _(() => [
        H(c.$slots, "default")
      ]),
      _: 3
    }, 40, ["class", "style", "tabindex", "data-panel-resize-handle-id", "data-panel-resize-handle-enabled", "data-panel-resize-handle-disabled"]));
  }
});
function de(t, i) {
  if (!t)
    throw new Error(i || "Assertion failed");
}
function ue(t, i) {
  if (t.length !== i.length)
    return !1;
  for (let n = 0; n < t.length; n++)
    if (t[n] !== i[n])
      return !1;
  return !0;
}
const M = 5;
function X(t, i, n = M) {
  const a = parseFloat(t.toFixed(n)), r = parseFloat(i.toFixed(n));
  return a < r ? -1 : a > r ? 1 : 0;
}
function ce(t, i, n = M) {
  return X(t, i, n) === 0;
}
const pe = {
  Panel: L,
  PanelGroup: T,
  PanelResizeHandle: V
};
export {
  L as Panel,
  T as PanelGroup,
  V as PanelResizeHandle,
  ue as areEqual,
  de as assert,
  pe as default,
  X as fuzzyCompareNumbers,
  ce as fuzzyNumbersEqual
};
