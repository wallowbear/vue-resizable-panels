import { defineComponent as N, inject as K, ref as I, computed as C, watch as Q, onMounted as O, onUnmounted as W, openBlock as B, createBlock as k, resolveDynamicComponent as F, normalizeClass as _, normalizeStyle as H, unref as M, withCtx as U, renderSlot as q, reactive as T, provide as V } from "vue";
const X = Symbol("PanelGroupContext");
let A = 0;
function Y(l) {
  return l || (A++, `vue-resizable-panels:${A}`);
}
const Z = /* @__PURE__ */ N({
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
  setup(l, { expose: t, emit: n }) {
    const a = l, o = K(X);
    if (!o)
      throw new Error("Panel components must be rendered within a PanelGroup container");
    const {
      collapsePanel: d,
      expandPanel: s,
      getPanelSize: r,
      getPanelStyle: x,
      groupId: S,
      isPanelCollapsed: D,
      reevaluatePanelConstraints: p,
      registerPanel: u,
      resizePanel: m,
      unregisterPanel: f
    } = o, v = Y(a.id), e = I({
      callbacks: {
        onCollapse: () => n("collapse"),
        onExpand: () => n("expand"),
        onResize: (g, w) => n("resize", g, w)
      },
      constraints: {
        collapsedSize: a.collapsedSize,
        collapsible: a.collapsible,
        defaultSize: a.defaultSize,
        maxSize: a.maxSize,
        minSize: a.minSize
      },
      id: v,
      idIsFromProps: a.id !== void 0,
      order: a.order
    }), i = C(() => {
      const g = r(e.value);
      return console.log(`Panel ${v} size:`, g), g;
    }), c = C(() => D(e.value)), z = C(() => {
      const g = x(e.value, a.defaultSize);
      return console.log(`Panel ${v} style:`, g), {
        ...g,
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
      (g, w) => {
        const R = { ...e.value.constraints };
        e.value.constraints.collapsedSize = g.collapsedSize, e.value.constraints.collapsible = g.collapsible, e.value.constraints.maxSize = g.maxSize, e.value.constraints.minSize = g.minSize, (R.collapsedSize !== g.collapsedSize || R.collapsible !== g.collapsible || R.maxSize !== g.maxSize || R.minSize !== g.minSize) && p(e.value, R);
      },
      { deep: !0 }
    ), O(() => {
      u(e.value);
    }), W(() => {
      f(e.value);
    }), t({
      collapse: () => d(e.value),
      expand: (g) => s(e.value, g),
      getId: () => v,
      getSize: () => r(e.value),
      isCollapsed: () => c.value,
      isExpanded: () => !D(e.value),
      resize: (g) => m(e.value, g)
    }), (g, w) => (B(), k(F(g.tagName), {
      class: _(g.className),
      style: H(z.value),
      "data-panel": !0,
      "data-panel-id": M(v),
      "data-panel-size": i.value,
      "data-panel-collapsible": g.collapsible || void 0,
      "data-panel-collapsed": c.value || void 0
    }, {
      default: U(() => [
        q(g.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-id", "data-panel-size", "data-panel-collapsible", "data-panel-collapsed"]));
  }
});
function y(l, t) {
  if (!l)
    throw new Error(t || "Assertion failed");
}
const J = 5;
function $(l, t, n = J) {
  const a = parseFloat(l.toFixed(n)), o = parseFloat(t.toFixed(n));
  return a < o ? -1 : a > o ? 1 : 0;
}
function P(l, t, n = J) {
  return $(l, t, n) === 0;
}
function G(l, t) {
  if (l.length !== t.length)
    return !1;
  for (let n = 0; n < l.length; n++)
    if (!P(l[n], t[n]))
      return !1;
  return !0;
}
function ee({
  panelConstraints: l,
  panelIndex: t,
  size: n
}) {
  const { collapsedSize: a = 0, collapsible: o, maxSize: d = 100, minSize: s = 0 } = l[t] ?? {};
  return o && P(n, a) ? a : n < s ? s : n > d ? d : n;
}
function L({
  panelConstraints: l,
  panelIndex: t,
  size: n
}) {
  return ee({
    panelConstraints: l,
    panelIndex: t,
    size: n
  });
}
function ne({
  delta: l,
  initialLayout: t,
  panelConstraints: n,
  pivotIndices: a,
  prevLayout: o,
  trigger: d
}) {
  if (P(l, 0))
    return t;
  const s = [...t], [r, x] = a;
  y(r != null, "Invalid first pivot index"), y(x != null, "Invalid second pivot index");
  let S = 0;
  if (d === "keyboard") {
    {
      const p = l < 0 ? x : r, u = n[p];
      y(
        u,
        `Panel constraints not found for index ${p}`
      );
      const {
        collapsedSize: m = 0,
        collapsible: f,
        minSize: v = 0
      } = u;
      if (f) {
        const e = t[p];
        if (y(
          e != null,
          `Previous layout not found for panel index ${p}`
        ), P(e, m)) {
          const i = v - e;
          $(i, Math.abs(l)) > 0 && (l = l < 0 ? 0 - i : i);
        }
      }
    }
    {
      const p = l < 0 ? r : x, u = n[p];
      y(
        u,
        `No panel constraints found for index ${p}`
      );
      const {
        collapsedSize: m = 0,
        collapsible: f,
        minSize: v = 0
      } = u;
      if (f) {
        const e = t[p];
        if (y(
          e != null,
          `Previous layout not found for panel index ${p}`
        ), P(e, v)) {
          const i = e - m;
          $(i, Math.abs(l)) > 0 && (l = l < 0 ? 0 - i : i);
        }
      }
    }
  }
  {
    const p = l < 0 ? 1 : -1;
    let u = l < 0 ? x : r, m = 0;
    for (; ; ) {
      const v = t[u];
      y(
        v != null,
        `Previous layout not found for panel index ${u}`
      );
      const i = L({
        panelConstraints: n,
        panelIndex: u,
        size: 100
      }) - v;
      if (m += i, u += p, u < 0 || u >= n.length)
        break;
    }
    const f = Math.min(Math.abs(l), Math.abs(m));
    l = l < 0 ? 0 - f : f;
  }
  {
    let u = l < 0 ? r : x;
    for (; u >= 0 && u < n.length; ) {
      const m = Math.abs(l) - Math.abs(S), f = t[u];
      y(
        f != null,
        `Previous layout not found for panel index ${u}`
      );
      const v = f - m, e = L({
        panelConstraints: n,
        panelIndex: u,
        size: v
      });
      if (!P(f, e) && (S += f - e, s[u] = e, S.toPrecision(3).localeCompare(Math.abs(l).toPrecision(3), void 0, {
        numeric: !0
      }) >= 0))
        break;
      l < 0 ? u-- : u++;
    }
  }
  if (G(o, s))
    return o;
  {
    const p = l < 0 ? x : r, u = t[p];
    y(
      u != null,
      `Previous layout not found for panel index ${p}`
    );
    const m = u + S, f = L({
      panelConstraints: n,
      panelIndex: p,
      size: m
    });
    if (s[p] = f, !P(f, m)) {
      let v = m - f, i = l < 0 ? x : r;
      for (; i >= 0 && i < n.length; ) {
        const c = s[i];
        y(
          c != null,
          `Previous layout not found for panel index ${i}`
        );
        const z = c + v, h = L({
          panelConstraints: n,
          panelIndex: i,
          size: z
        });
        if (P(c, h) || (v -= h - c, s[i] = h), P(v, 0))
          break;
        l > 0 ? i-- : i++;
      }
    }
  }
  const D = s.reduce((p, u) => u + p, 0);
  return P(D, 100) ? s : o;
}
function le(l, t, n, a) {
  const o = a.getBoundingClientRect(), d = t === "horizontal", s = d ? l.clientX : l.clientY, r = d ? o.width : o.height;
  return (s - n) / r * 100;
}
function te({
  panelDataArray: l
}) {
  const t = Array(l.length), n = [];
  let a = 0;
  for (let o = 0; o < l.length; o++) {
    const d = l[o], { defaultSize: s } = d.constraints;
    s != null ? (t[o] = s, a += s) : n.push(o);
  }
  if (n.length > 0) {
    const o = 100 - a, d = Math.max(0, o / n.length);
    for (const s of n)
      t[s] = d;
  }
  return t;
}
function oe({
  defaultSize: l,
  dragState: t,
  layout: n,
  panelData: a,
  panelIndex: o,
  precision: d = 3
}) {
  const s = n[o];
  let r;
  return s == null ? r = l != null ? l.toPrecision(d) : "1" : a.length === 1 ? r = "1" : r = s.toPrecision(d), {
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
function ae(l, t, n) {
  const a = parseInt(t.split("-").pop() || "0"), o = a, d = a + 1;
  return [o, d];
}
function se(l, t) {
  const n = l === "horizontal";
  return "clientX" in t && "clientY" in t ? n ? t.clientX : t.clientY : 0;
}
function ie({
  layout: l,
  panelConstraints: t
}) {
  const n = [...l];
  let a = 0;
  for (let o = 0; o < n.length; o++) {
    const d = n[o], s = L({
      panelConstraints: t,
      panelIndex: o,
      size: d
    });
    n[o] = s, a += s;
  }
  if (!P(a, 100))
    for (let o = 0; o < n.length; o++)
      n[o] = n[o] / a * 100;
  return n;
}
const re = /* @__PURE__ */ N({
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
    const n = l, a = Y(n.id), o = I(), d = I(null), s = I([]), r = I([]);
    I(0);
    const x = C(() => ({
      display: "flex",
      flexDirection: n.direction === "horizontal" ? "row" : "column",
      height: "100%",
      overflow: "hidden",
      width: "100%",
      ...n.style
    })), S = (e, i) => {
      if (console.log("Starting drag for handle:", e), !o.value)
        return;
      const c = o.value.querySelector(
        `[data-panel-resize-handle-id="${e}"]`
      );
      if (!c) {
        console.error(`Drag handle element not found for id "${e}"`);
        return;
      }
      const z = se(
        n.direction,
        i
      );
      d.value = {
        dragHandleId: e,
        dragHandleRect: c.getBoundingClientRect(),
        initialCursorPosition: z,
        initialLayout: [...s.value]
      }, console.log("Drag state set:", d.value), u();
    }, D = () => {
      d.value = null;
    }, p = (e) => {
      if (!d.value || !o.value)
        return;
      console.log("Mouse move during drag");
      const { initialCursorPosition: i, initialLayout: c, dragHandleId: z } = d.value, h = le(
        { clientX: e.clientX, clientY: e.clientY },
        n.direction,
        i,
        o.value
      );
      console.log("Delta percentage:", h);
      const E = ae(
        a,
        z,
        o.value
      );
      console.log("Pivot indices:", E);
      const b = ne({
        delta: h,
        initialLayout: c,
        panelConstraints: r.value.map((j) => j.constraints),
        pivotIndices: E,
        prevLayout: s.value,
        trigger: "mouse-or-touch"
      });
      console.log("Next layout:", b), G(s.value, b) || (s.value = b, n.onLayout && n.onLayout(b), t("layout", b));
    }, u = () => {
      console.log("🎯 Adding global event listeners"), document.addEventListener("mousemove", p), document.addEventListener("mouseup", f), console.log("✅ Global event listeners added");
    }, m = () => {
      console.log("🧹 Removing global event listeners"), document.removeEventListener("mousemove", p), document.removeEventListener("mouseup", f), console.log("✅ Global event listeners removed");
    }, f = () => {
      console.log("🛑 Stopping drag and cleanup"), D(), m();
    }, v = T({
      collapsePanel: (e) => {
        console.log("collapsePanel", e);
      },
      get direction() {
        return n.direction;
      },
      get dragState() {
        return d.value;
      },
      expandPanel: (e, i) => {
        console.log("expandPanel", e, i);
      },
      getPanelSize: (e) => {
        const i = r.value.findIndex((c) => c.id === e.id);
        return s.value[i] || 0;
      },
      getPanelStyle: (e, i) => {
        const c = r.value.findIndex((z) => z.id === e.id);
        return oe({
          defaultSize: i,
          dragState: d.value,
          layout: s.value,
          panelData: r.value,
          panelIndex: c
        });
      },
      groupId: a,
      handleResizeDrag: (e, i) => {
        if (!d.value) {
          S(e, i);
          return;
        }
        p(i);
      },
      isPanelCollapsed: (e) => !1,
      isPanelExpanded: (e) => !v.isPanelCollapsed(e),
      reevaluatePanelConstraints: (e, i) => {
        console.log("reevaluatePanelConstraints", e, i);
      },
      registerPanel: (e) => {
        r.value.push(e), r.value.sort((z, h) => {
          const E = z.order, b = h.order;
          return E == null && b == null ? 0 : E == null ? -1 : b == null ? 1 : E - b;
        });
        const i = te({
          panelDataArray: r.value
        }), c = ie({
          layout: i,
          panelConstraints: r.value.map(
            (z) => z.constraints
          )
        });
        G(s.value, c) || (s.value = c, n.onLayout && n.onLayout(c), t("layout", c));
      },
      resizePanel: (e, i) => {
        const c = r.value.findIndex((z) => z.id === e.id);
        c !== -1 && (s.value[c] = i);
      },
      startDragging: S,
      stopDragging: f,
      unregisterPanel: (e) => {
        const i = r.value.findIndex((c) => c.id === e.id);
        if (i !== -1) {
          if (r.value.splice(i, 1), s.value.splice(i, 1), r.value.length > 0) {
            const c = s.value.reduce((z, h) => z + h, 0);
            if (c < 100) {
              const z = (100 - c) / s.value.length;
              s.value = s.value.map((h) => h + z);
            }
          }
          n.onLayout && n.onLayout(s.value), t("layout", s.value);
        }
      },
      get panelGroupElement() {
        return o.value || null;
      }
    });
    return V(X, v), (e, i) => (B(), k(F(e.tagName), {
      ref_key: "panelGroupElementRef",
      ref: o,
      class: _(e.className),
      style: H(x.value),
      "data-panel-group": !0,
      "data-panel-group-direction": e.direction,
      "data-panel-group-id": M(a)
    }, {
      default: U(() => [
        q(e.$slots, "default")
      ]),
      _: 3
    }, 8, ["class", "style", "data-panel-group-direction", "data-panel-group-id"]));
  }
}), ue = /* @__PURE__ */ N({
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
    const n = l, a = K(X);
    if (!a)
      throw new Error("PanelResizeHandle components must be rendered within a PanelGroup container");
    const {
      direction: o,
      groupId: d
    } = a, s = I(), r = Y(n.id), x = I(!1), S = I(!1), D = C(() => ({
      touchAction: "none",
      userSelect: "none",
      cursor: o === "horizontal" ? "col-resize" : "row-resize",
      ...n.style
    })), p = () => {
      x.value = !1, t("blur");
    }, u = () => {
      x.value = !0, t("focus");
    }, m = (e) => {
      n.disabled || (console.log("🖱️ Mouse down on resize handle:", r), e.preventDefault(), S.value = !0, a.startDragging && a.startDragging(r, e), document.addEventListener("mousemove", f, { passive: !1 }), document.addEventListener("mouseup", v, { passive: !1 }), console.log("🎯 Started dragging, added global listeners"), t("pointerDown"), t("dragging", !0));
    }, f = (e) => {
      S.value && (console.log("🖱️ Mouse move during drag"), e.preventDefault(), a.handleResizeDrag && a.handleResizeDrag(r, e));
    }, v = (e) => {
      S.value && (console.log("🖱️ Mouse up, ending drag"), e.preventDefault(), S.value = !1, document.removeEventListener("mousemove", f), document.removeEventListener("mouseup", v), console.log("🧹 Ended dragging, removed global listeners"), t("pointerUp"), t("dragging", !1));
    };
    return O(() => {
      console.log("PanelResizeHandle mounted:", r);
    }), W(() => {
      S.value && (document.removeEventListener("mousemove", f), document.removeEventListener("mouseup", v));
    }), (e, i) => (B(), k(F(e.tagName), {
      ref_key: "elementRef",
      ref: s,
      class: _(e.className),
      style: H(D.value),
      tabindex: e.disabled ? void 0 : e.tabIndex,
      "data-panel-resize-handle": !0,
      "data-panel-resize-handle-id": M(r),
      "data-panel-resize-handle-enabled": !e.disabled || void 0,
      "data-panel-resize-handle-disabled": e.disabled || void 0,
      "data-panel-group-direction": M(o),
      "data-panel-group-id": M(d),
      role: "separator",
      onBlur: p,
      onFocus: u,
      onMousedown: m
    }, {
      default: U(() => [
        q(e.$slots, "default")
      ]),
      _: 3
    }, 40, ["class", "style", "tabindex", "data-panel-resize-handle-id", "data-panel-resize-handle-enabled", "data-panel-resize-handle-disabled", "data-panel-group-direction", "data-panel-group-id"]));
  }
});
function fe(l, t) {
  if (l.length !== t.length)
    return !1;
  for (let n = 0; n < l.length; n++)
    if (l[n] !== t[n])
      return !1;
  return !0;
}
const ve = {
  Panel: Z,
  PanelGroup: re,
  PanelResizeHandle: ue
};
export {
  Z as Panel,
  re as PanelGroup,
  ue as PanelResizeHandle,
  fe as areEqual,
  y as assert,
  ve as default,
  $ as fuzzyCompareNumbers,
  P as fuzzyNumbersEqual
};
