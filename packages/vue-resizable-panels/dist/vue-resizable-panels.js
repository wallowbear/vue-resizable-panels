import { defineComponent as B, inject as O, ref as E, computed as M, watch as T, onMounted as W, onUnmounted as J, openBlock as k, createBlock as F, resolveDynamicComponent as _, normalizeClass as H, normalizeStyle as U, unref as w, withCtx as q, renderSlot as X, reactive as V, provide as Z } from "vue";
const Y = Symbol("PanelGroupContext");
let K = 0;
function j(l) {
  return l || (K++, `vue-resizable-panels:${K}`);
}
const ee = /* @__PURE__ */ B({
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
  setup(l, { expose: a, emit: n }) {
    const o = l, t = n, u = O(Y);
    if (!u)
      throw new Error("Panel components must be rendered within a PanelGroup container");
    const {
      collapsePanel: i,
      expandPanel: s,
      getPanelSize: c,
      getPanelStyle: h,
      groupId: P,
      isPanelCollapsed: p,
      reevaluatePanelConstraints: r,
      registerPanel: S,
      resizePanel: z,
      unregisterPanel: m
    } = u, f = j(o.id), e = E({
      callbacks: {
        onCollapse: () => t("collapse"),
        onExpand: () => t("expand"),
        onResize: (g, $) => t("resize", g, $)
      },
      constraints: {
        collapsedSize: o.collapsedSize,
        collapsible: o.collapsible,
        defaultSize: o.defaultSize,
        maxSize: o.maxSize,
        minSize: o.minSize
      },
      id: f,
      idIsFromProps: o.id !== void 0,
      order: o.order
    }), d = M(() => {
      const g = c(e.value);
      return console.log(`Panel ${f} size:`, g), g;
    }), v = M(() => p(e.value)), x = M(() => {
      const g = h(e.value, o.defaultSize);
      return console.log(`Panel ${f} style:`, g), {
        ...g,
        ...o.style
      };
    });
    return T(
      () => ({
        collapsedSize: o.collapsedSize,
        collapsible: o.collapsible,
        maxSize: o.maxSize,
        minSize: o.minSize
      }),
      (g, $) => {
        const L = { ...e.value.constraints };
        e.value.constraints.collapsedSize = g.collapsedSize, e.value.constraints.collapsible = g.collapsible, e.value.constraints.maxSize = g.maxSize, e.value.constraints.minSize = g.minSize, (L.collapsedSize !== g.collapsedSize || L.collapsible !== g.collapsible || L.maxSize !== g.maxSize || L.minSize !== g.minSize) && r(e.value, L);
      },
      { deep: !0 }
    ), W(() => {
      S(e.value);
    }), J(() => {
      m(e.value);
    }), a({
      collapse: () => i(e.value),
      expand: (g) => s(e.value, g),
      getId: () => f,
      getSize: () => c(e.value),
      isCollapsed: () => v.value,
      isExpanded: () => !p(e.value),
      resize: (g) => z(e.value, g)
    }), (g, $) => (k(), F(_(g.tagName), {
      class: H(g.className),
      style: U(x.value),
      "data-panel": !0,
      "data-panel-id": w(f),
      "data-panel-size": d.value,
      "data-panel-collapsible": g.collapsible || void 0,
      "data-panel-collapsed": v.value || void 0
    }, {
      default: q(() => [
        X(g.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-id", "data-panel-size", "data-panel-collapsible", "data-panel-collapsed"]));
  }
});
function I(l, a) {
  if (!l)
    throw new Error(a || "Assertion failed");
}
const Q = 5;
function G(l, a, n = Q) {
  const o = parseFloat(l.toFixed(n)), t = parseFloat(a.toFixed(n));
  return o < t ? -1 : o > t ? 1 : 0;
}
function b(l, a, n = Q) {
  return G(l, a, n) === 0;
}
function N(l, a) {
  if (l.length !== a.length)
    return !1;
  for (let n = 0; n < l.length; n++)
    if (!b(l[n], a[n]))
      return !1;
  return !0;
}
function ne({
  panelConstraints: l,
  panelIndex: a,
  size: n
}) {
  const { collapsedSize: o = 0, collapsible: t, maxSize: u = 100, minSize: i = 0 } = l[a] ?? {};
  return t && b(n, o) ? o : n < i ? i : n > u ? u : n;
}
function C({
  panelConstraints: l,
  panelIndex: a,
  size: n
}) {
  return ne({
    panelConstraints: l,
    panelIndex: a,
    size: n
  });
}
function le({
  delta: l,
  initialLayout: a,
  panelConstraints: n,
  pivotIndices: o,
  prevLayout: t,
  trigger: u
}) {
  if (b(l, 0))
    return a;
  const i = [...a], [s, c] = o;
  I(s != null, "Invalid first pivot index"), I(c != null, "Invalid second pivot index");
  let h = 0;
  if (u === "keyboard") {
    {
      const p = l < 0 ? c : s, r = n[p];
      I(
        r,
        `Panel constraints not found for index ${p}`
      );
      const {
        collapsedSize: S = 0,
        collapsible: z,
        minSize: m = 0
      } = r;
      if (z) {
        const f = a[p];
        if (I(
          f != null,
          `Previous layout not found for panel index ${p}`
        ), b(f, S)) {
          const e = m - f;
          G(e, Math.abs(l)) > 0 && (l = l < 0 ? 0 - e : e);
        }
      }
    }
    {
      const p = l < 0 ? s : c, r = n[p];
      I(
        r,
        `No panel constraints found for index ${p}`
      );
      const {
        collapsedSize: S = 0,
        collapsible: z,
        minSize: m = 0
      } = r;
      if (z) {
        const f = a[p];
        if (I(
          f != null,
          `Previous layout not found for panel index ${p}`
        ), b(f, m)) {
          const e = f - S;
          G(e, Math.abs(l)) > 0 && (l = l < 0 ? 0 - e : e);
        }
      }
    }
  }
  {
    const p = l < 0 ? 1 : -1;
    let r = l < 0 ? c : s, S = 0;
    for (; ; ) {
      const m = a[r];
      I(
        m != null,
        `Previous layout not found for panel index ${r}`
      );
      const e = C({
        panelConstraints: n,
        panelIndex: r,
        size: 100
      }) - m;
      if (S += e, r += p, r < 0 || r >= n.length)
        break;
    }
    const z = Math.min(Math.abs(l), Math.abs(S));
    l = l < 0 ? 0 - z : z;
  }
  {
    let r = l < 0 ? s : c;
    for (; r >= 0 && r < n.length; ) {
      const S = Math.abs(l) - Math.abs(h), z = a[r];
      I(
        z != null,
        `Previous layout not found for panel index ${r}`
      );
      const m = z - S, f = C({
        panelConstraints: n,
        panelIndex: r,
        size: m
      });
      if (!b(z, f) && (h += z - f, i[r] = f, h.toPrecision(3).localeCompare(Math.abs(l).toPrecision(3), void 0, {
        numeric: !0
      }) >= 0))
        break;
      l < 0 ? r-- : r++;
    }
  }
  if (N(t, i))
    return t;
  {
    const p = l < 0 ? c : s, r = a[p];
    I(
      r != null,
      `Previous layout not found for panel index ${p}`
    );
    const S = r + h, z = C({
      panelConstraints: n,
      panelIndex: p,
      size: S
    });
    if (i[p] = z, !b(z, S)) {
      let m = S - z, e = l < 0 ? c : s;
      for (; e >= 0 && e < n.length; ) {
        const d = i[e];
        I(
          d != null,
          `Previous layout not found for panel index ${e}`
        );
        const v = d + m, x = C({
          panelConstraints: n,
          panelIndex: e,
          size: v
        });
        if (b(d, x) || (m -= x - d, i[e] = x), b(m, 0))
          break;
        l > 0 ? e-- : e++;
      }
    }
  }
  const P = i.reduce((p, r) => r + p, 0);
  return b(P, 100) ? i : t;
}
function te(l, a, n, o) {
  const t = o.getBoundingClientRect(), u = a === "horizontal", i = u ? l.clientX : l.clientY, s = u ? t.width : t.height;
  return (i - n) / s * 100;
}
function oe({
  panelDataArray: l
}) {
  const a = Array(l.length), n = [];
  let o = 0;
  for (let t = 0; t < l.length; t++) {
    const u = l[t], { defaultSize: i } = u.constraints;
    i != null ? (a[t] = i, o += i) : n.push(t);
  }
  if (n.length > 0) {
    const t = 100 - o, u = Math.max(0, t / n.length);
    for (const i of n)
      a[i] = u;
  }
  return a;
}
function ae({
  defaultSize: l,
  dragState: a,
  layout: n,
  panelData: o,
  panelIndex: t,
  precision: u = 3
}) {
  const i = n[t];
  let s;
  return i == null ? s = l != null ? l.toPrecision(u) : "1" : o.length === 1 ? s = "1" : s = i.toPrecision(u), {
    flexBasis: 0,
    flexGrow: s,
    flexShrink: 1,
    // Without this, Panel sizes may be unintentionally overridden by their content
    overflow: "hidden",
    // Disable pointer events inside of a panel during resize
    // This avoid edge cases like nested iframes
    pointerEvents: a !== null ? "none" : void 0
  };
}
function ie(l, a, n) {
  const o = parseInt(a.split("-").pop() || "0"), t = o, u = o + 1;
  return [t, u];
}
function se(l, a) {
  const n = l === "horizontal";
  return "clientX" in a && "clientY" in a ? n ? a.clientX : a.clientY : 0;
}
function re({
  layout: l,
  panelConstraints: a
}) {
  const n = [...l];
  let o = 0;
  for (let t = 0; t < n.length; t++) {
    const u = n[t], i = C({
      panelConstraints: a,
      panelIndex: t,
      size: u
    });
    n[t] = i, o += i;
  }
  if (!b(o, 100))
    for (let t = 0; t < n.length; t++)
      n[t] = n[t] / o * 100;
  return n;
}
const ue = /* @__PURE__ */ B({
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
  setup(l, { emit: a }) {
    const n = l, o = a, t = j(n.id), u = E(), i = E(null), s = E([]), c = E([]);
    E(0);
    const h = M(() => ({
      display: "flex",
      flexDirection: n.direction === "horizontal" ? "row" : "column",
      height: "100%",
      overflow: "hidden",
      width: "100%",
      ...n.style
    })), P = (e, d) => {
      if (console.log("Starting drag for handle:", e), !u.value)
        return;
      const v = u.value.querySelector(
        `[data-panel-resize-handle-id="${e}"]`
      );
      if (!v) {
        console.error(`Drag handle element not found for id "${e}"`);
        return;
      }
      const x = se(
        n.direction,
        d
      );
      i.value = {
        dragHandleId: e,
        dragHandleRect: v.getBoundingClientRect(),
        initialCursorPosition: x,
        initialLayout: [...s.value]
      }, console.log("Drag state set:", i.value), S();
    }, p = () => {
      i.value = null;
    }, r = (e) => {
      if (!i.value || !u.value)
        return;
      console.log("Mouse move during drag");
      const { initialCursorPosition: d, initialLayout: v, dragHandleId: x } = i.value, D = te(
        { clientX: e.clientX, clientY: e.clientY },
        n.direction,
        d,
        u.value
      );
      console.log("Delta percentage:", D);
      const R = ie(
        t,
        x,
        u.value
      );
      console.log("Pivot indices:", R);
      const y = le({
        delta: D,
        initialLayout: v,
        panelConstraints: c.value.map((A) => A.constraints),
        pivotIndices: R,
        prevLayout: s.value,
        trigger: "mouse-or-touch"
      });
      console.log("Next layout:", y), N(s.value, y) || (s.value = y, n.onLayout && n.onLayout(y), o("layout", y));
    }, S = () => {
      console.log("🎯 Adding global event listeners"), document.addEventListener("mousemove", r), document.addEventListener("mouseup", m), console.log("✅ Global event listeners added");
    }, z = () => {
      console.log("🧹 Removing global event listeners"), document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", m), console.log("✅ Global event listeners removed");
    }, m = () => {
      console.log("🛑 Stopping drag and cleanup"), p(), z();
    }, f = V({
      collapsePanel: (e) => {
        console.log("collapsePanel", e);
      },
      get direction() {
        return n.direction;
      },
      get dragState() {
        return i.value;
      },
      expandPanel: (e, d) => {
        console.log("expandPanel", e, d);
      },
      getPanelSize: (e) => {
        const d = c.value.findIndex((v) => v.id === e.id);
        return s.value[d] || 0;
      },
      getPanelStyle: (e, d) => {
        const v = c.value.findIndex((x) => x.id === e.id);
        return ae({
          defaultSize: d,
          dragState: i.value,
          layout: s.value,
          panelData: c.value,
          panelIndex: v
        });
      },
      groupId: t,
      handleResizeDrag: (e, d) => {
        if (!i.value) {
          P(e, d);
          return;
        }
        r(d);
      },
      isPanelCollapsed: (e) => !1,
      isPanelExpanded: (e) => !f.isPanelCollapsed(e),
      reevaluatePanelConstraints: (e, d) => {
        console.log("reevaluatePanelConstraints", e, d);
      },
      registerPanel: (e) => {
        c.value.push(e), c.value.sort((x, D) => {
          const R = x.order, y = D.order;
          return R == null && y == null ? 0 : R == null ? -1 : y == null ? 1 : R - y;
        });
        const d = oe({
          panelDataArray: c.value
        }), v = re({
          layout: d,
          panelConstraints: c.value.map(
            (x) => x.constraints
          )
        });
        N(s.value, v) || (s.value = v, n.onLayout && n.onLayout(v), o("layout", v));
      },
      resizePanel: (e, d) => {
        const v = c.value.findIndex((x) => x.id === e.id);
        v !== -1 && (s.value[v] = d);
      },
      startDragging: P,
      stopDragging: m,
      unregisterPanel: (e) => {
        const d = c.value.findIndex((v) => v.id === e.id);
        if (d !== -1) {
          if (c.value.splice(d, 1), s.value.splice(d, 1), c.value.length > 0) {
            const v = s.value.reduce((x, D) => x + D, 0);
            if (v < 100) {
              const x = (100 - v) / s.value.length;
              s.value = s.value.map((D) => D + x);
            }
          }
          n.onLayout && n.onLayout(s.value), o("layout", s.value);
        }
      },
      get panelGroupElement() {
        return u.value || null;
      }
    });
    return Z(Y, f), (e, d) => (k(), F(_(e.tagName), {
      ref_key: "panelGroupElementRef",
      ref: u,
      class: H(e.className),
      style: U(h.value),
      "data-panel-group": !0,
      "data-panel-group-direction": e.direction,
      "data-panel-group-id": w(t)
    }, {
      default: q(() => [
        X(e.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-group-direction", "data-panel-group-id"]));
  }
}), de = /* @__PURE__ */ B({
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
  setup(l, { emit: a }) {
    const n = l, o = a, t = O(Y);
    if (!t)
      throw new Error("PanelResizeHandle components must be rendered within a PanelGroup container");
    const {
      direction: u,
      groupId: i
    } = t, s = E(), c = j(n.id), h = E(!1), P = E(!1), p = M(() => ({
      touchAction: "none",
      userSelect: "none",
      cursor: u === "horizontal" ? "col-resize" : "row-resize",
      ...n.style
    })), r = () => {
      h.value = !1, o("blur");
    }, S = () => {
      h.value = !0, o("focus");
    }, z = (e) => {
      n.disabled || (console.log("🖱️ Mouse down on resize handle:", c), e.preventDefault(), P.value = !0, t.startDragging && t.startDragging(c, e), document.addEventListener("mousemove", m, { passive: !1 }), document.addEventListener("mouseup", f, { passive: !1 }), console.log("🎯 Started dragging, added global listeners"), o("pointerDown"), o("dragging", !0));
    }, m = (e) => {
      P.value && (console.log("🖱️ Mouse move during drag"), e.preventDefault(), t.handleResizeDrag && t.handleResizeDrag(c, e));
    }, f = (e) => {
      P.value && (console.log("🖱️ Mouse up, ending drag"), e.preventDefault(), P.value = !1, document.removeEventListener("mousemove", m), document.removeEventListener("mouseup", f), console.log("🧹 Ended dragging, removed global listeners"), o("pointerUp"), o("dragging", !1));
    };
    return W(() => {
      console.log("PanelResizeHandle mounted:", c);
    }), J(() => {
      P.value && (document.removeEventListener("mousemove", m), document.removeEventListener("mouseup", f));
    }), (e, d) => (k(), F(_(e.tagName), {
      ref_key: "elementRef",
      ref: s,
      class: H(e.className),
      style: U(p.value),
      tabindex: e.disabled ? void 0 : e.tabIndex,
      "data-panel-resize-handle": !0,
      "data-panel-resize-handle-id": w(c),
      "data-panel-resize-handle-enabled": !e.disabled || void 0,
      "data-panel-resize-handle-disabled": e.disabled || void 0,
      "data-panel-group-direction": w(u),
      "data-panel-group-id": w(i),
      role: "separator",
      onBlur: r,
      onFocus: S,
      onMousedown: z
    }, {
      default: q(() => [
        X(e.$slots, "default")
      ]),
      _: 3
    }, 40, ["class", "style", "tabindex", "data-panel-resize-handle-id", "data-panel-resize-handle-enabled", "data-panel-resize-handle-disabled", "data-panel-group-direction", "data-panel-group-id"]));
  }
});
function ve(l, a) {
  if (l.length !== a.length)
    return !1;
  for (let n = 0; n < l.length; n++)
    if (l[n] !== a[n])
      return !1;
  return !0;
}
const ge = {
  Panel: ee,
  PanelGroup: ue,
  PanelResizeHandle: de
};
export {
  ee as Panel,
  ue as PanelGroup,
  de as PanelResizeHandle,
  ve as areEqual,
  I as assert,
  ge as default,
  G as fuzzyCompareNumbers,
  b as fuzzyNumbersEqual
};
