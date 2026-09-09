'use strict';

var view = require('@codemirror/view');
var language = require('@codemirror/language');
var highlight = require('@lezer/highlight');

// src/editor/utils.ts
var UNSAFE_MERGE_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
function deepMerge(a, b) {
  const result = { ...a };
  if (!b) {
    return result;
  }
  for (const key in b) {
    if (!Object.hasOwn(b, key) || UNSAFE_MERGE_KEYS.has(key)) {
      continue;
    }
    if (b[key] && typeof b[key] === "object" && !Array.isArray(b[key]) && typeof a[key] === "object") {
      result[key] = deepMerge(a[key], b[key]);
    } else {
      result[key] = b[key];
    }
  }
  return result;
}
var ThemeEnum = /* @__PURE__ */ ((ThemeEnum2) => {
  ThemeEnum2["DARK"] = "dark";
  ThemeEnum2["LIGHT"] = "light";
  ThemeEnum2["AUTO"] = "auto";
  return ThemeEnum2;
})(ThemeEnum || {});
function createTheme({
  default: defaultTheme,
  dark: darkTheme,
  light: lightTheme
}) {
  const flatDefault = flattenThemeStyles(defaultTheme);
  const flatDark = flattenThemeStyles(darkTheme || {});
  const flatLight = flattenThemeStyles(lightTheme || {});
  return (theme) => {
    if (theme === "dark" /* DARK */) {
      return deepMerge(flatDefault, flatDark);
    }
    if (theme === "light" /* LIGHT */) {
      return deepMerge(flatDefault, flatLight);
    }
    return flatDefault;
  };
}
function flattenThemeStyles(themeStyles, parentSelector) {
  const flattened = {};
  for (const [selectors, styles] of Object.entries(themeStyles)) {
    for (const selector of selectors.split(",").map((s) => s.trim())) {
      if (typeof styles === "object" && !Array.isArray(styles)) {
        const fullSelector = fixSelector(parentSelector ? `${parentSelector} ${selector}` : selector);
        const nestedStyles = flattenThemeStyles(styles, fullSelector);
        Object.assign(flattened, nestedStyles);
      } else {
        if (parentSelector) {
          flattened[parentSelector] = { ...flattened[parentSelector], [selector]: styles };
        } else {
          flattened[selector] = styles;
        }
      }
    }
  }
  return flattened;
}
function fixSelector(selector) {
  return selector.replace(/\s&/g, "");
}
function cursorInRange(view, from, to) {
  const selection = view.state.selection.main;
  return selection.from <= to && selection.to >= from;
}
function selectionOverlapsRange(view, from, to) {
  for (const range of view.state.selection.ranges) {
    if (range.from <= to && range.to >= from) {
      return true;
    }
  }
  return false;
}
function toggleMarkdownStyle(marker) {
  return (view) => {
    const { state } = view;
    const { from, to, empty } = state.selection.main;
    const selectedText = state.sliceDoc(from, to);
    const markerLen = marker.length;
    const beforeFrom = Math.max(0, from - markerLen);
    const afterTo = Math.min(state.doc.length, to + markerLen);
    const textBefore = state.sliceDoc(beforeFrom, from);
    const textAfter = state.sliceDoc(to, afterTo);
    const isWrapped = textBefore === marker && textAfter === marker;
    if (isWrapped) {
      view.dispatch({
        changes: [
          { from: beforeFrom, to: from, insert: "" },
          { from: to, to: afterTo, insert: "" }
        ],
        selection: { anchor: beforeFrom, head: beforeFrom + selectedText.length }
      });
    } else if (empty) {
      view.dispatch({
        changes: { from, to, insert: marker + marker },
        selection: { anchor: from + markerLen }
      });
    } else {
      view.dispatch({
        changes: { from, to, insert: marker + selectedText + marker },
        selection: { anchor: from + markerLen, head: to + markerLen }
      });
    }
    return true;
  };
}
var lightTokens = {
  // Typography
  "--draftly-font-sans": "var(--font-sans, sans-serif)",
  "--draftly-font-mono": "var(--font-jetbrains-mono, monospace)",
  // Text
  "--draftly-color-text": "var(--color-foreground, #0f172a)",
  "--draftly-color-muted": "var(--color-muted-foreground, #6a737d)",
  "--draftly-color-link": "var(--color-primary, #0366d6)",
  "--draftly-color-link-hover": "#0056b3",
  "--draftly-color-success": "#22863a",
  "--draftly-color-danger": "var(--color-destructive, #d73a49)",
  // Containers
  "--draftly-color-border": "var(--color-border, #d7dee7)",
  "--draftly-color-surface": "var(--color-background, #ffffff)",
  "--draftly-color-surface-raised": "var(--color-background, #ffffff)",
  "--draftly-surface-code": "rgba(0, 0, 0, 0.03)",
  "--draftly-surface-code-inline": "rgba(0, 0, 0, 0.05)",
  "--draftly-surface-code-header": "rgba(0, 0, 0, 0.06)",
  "--draftly-surface-code-caption": "rgba(0, 0, 0, 0.06)",
  "--draftly-surface-header": "rgba(15, 23, 42, 0.04)",
  "--draftly-surface-stripe": "rgba(15, 23, 42, 0.02)",
  "--draftly-surface-hover": "rgba(15, 23, 42, 0.05)",
  "--draftly-color-tooltip-bg": "#24292e",
  "--draftly-color-tooltip-fg": "#ffffff",
  "--draftly-shadow-popover": "0 10px 24px rgba(15, 23, 42, 0.12)",
  // Generic foreground-on-background tints, for chrome that has no more
  // specific surface role. Most components do — see the `--draftly-surface-*`
  // tokens — because their light and dark values are not symmetric.
  "--draftly-tint-1": "rgba(0, 0, 0, 0.02)",
  "--draftly-tint-2": "rgba(0, 0, 0, 0.03)",
  "--draftly-tint-5": "rgba(0, 0, 0, 0.1)",
  // Diff and highlight accents. `-line` values are the translucent row washes,
  // `-text` the legible foreground on top of them.
  "--draftly-color-add": "#22c55e",
  "--draftly-color-add-text": "#16a34a",
  "--draftly-color-add-line": "rgba(34, 197, 94, 0.12)",
  "--draftly-color-add-word": "rgba(34, 197, 94, 0.25)",
  "--draftly-color-del": "#ef4444",
  "--draftly-color-del-text": "#dc2626",
  "--draftly-color-del-line": "rgba(239, 68, 68, 0.12)",
  "--draftly-color-del-word": "rgba(239, 68, 68, 0.25)",
  "--draftly-color-mark": "#f0b429",
  "--draftly-color-mark-line": "rgba(255, 220, 100, 0.2)",
  "--draftly-color-mark-word": "rgba(255, 220, 100, 0.4)",
  "--draftly-color-error-surface": "rgba(255, 0, 0, 0.1)"
};
var darkTokens = {
  "--draftly-color-text": "var(--color-foreground, #e6edf3)",
  "--draftly-color-muted": "var(--color-muted-foreground, #8b949e)",
  "--draftly-color-link": "var(--color-primary, #58a6ff)",
  "--draftly-color-link-hover": "#79c0ff",
  "--draftly-color-success": "#7ee787",
  "--draftly-color-danger": "var(--color-destructive, #f85149)",
  "--draftly-color-border": "var(--color-border, #30363d)",
  "--draftly-color-surface": "var(--color-background, #0d1117)",
  "--draftly-color-surface-raised": "var(--color-background, #161b22)",
  "--draftly-surface-code": "rgba(255, 255, 255, 0.05)",
  "--draftly-surface-code-inline": "rgba(255, 255, 255, 0.1)",
  "--draftly-surface-code-header": "rgba(255, 255, 255, 0.08)",
  "--draftly-surface-code-caption": "rgba(255, 255, 255, 0.05)",
  "--draftly-surface-header": "rgba(255, 255, 255, 0.05)",
  "--draftly-surface-stripe": "rgba(255, 255, 255, 0.025)",
  "--draftly-surface-hover": "rgba(255, 255, 255, 0.08)",
  "--draftly-color-tooltip-bg": "#30363d",
  "--draftly-color-tooltip-fg": "#c9d1d9",
  "--draftly-shadow-popover": "0 12px 28px rgba(0, 0, 0, 0.35)",
  "--draftly-tint-1": "rgba(255, 255, 255, 0.02)",
  "--draftly-tint-2": "rgba(255, 255, 255, 0.03)",
  "--draftly-tint-5": "rgba(255, 255, 255, 0.1)",
  "--draftly-color-add-text": "#4ade80",
  "--draftly-color-add-line": "rgba(34, 197, 94, 0.15)",
  "--draftly-color-add-word": "rgba(34, 197, 94, 0.3)",
  "--draftly-color-del-text": "#f87171",
  "--draftly-color-del-line": "rgba(239, 68, 68, 0.15)",
  "--draftly-color-del-word": "rgba(239, 68, 68, 0.3)",
  "--draftly-color-mark": "#d9a520",
  "--draftly-color-mark-line": "rgba(255, 220, 100, 0.15)",
  "--draftly-color-mark-word": "rgba(255, 220, 100, 0.3)",
  "--draftly-color-error-surface": "rgba(255, 0, 0, 0.15)"
};
var sharedStyles = {
  "&.cm-draftly": {
    fontSize: "16px",
    lineHeight: "1.6",
    backgroundColor: "transparent !important"
  },
  "&.cm-draftly .cm-content": {
    width: "100%",
    maxWidth: "48rem",
    padding: "0 0.5rem",
    margin: "0 auto",
    fontFamily: "var(--draftly-font-sans)",
    fontSize: "16px",
    lineHeight: "1.6"
  }
};
var editorOnlyStyles = {
  "&.cm-draftly .cm-content .cm-line": {
    paddingInline: 0
  },
  "&.cm-draftly .cm-content .cm-widgetBuffer": {
    display: "none !important"
  },
  // The editor supplies its own caret and selection affordances; the browser's
  // focus ring on the scroller adds nothing but a box around the document.
  "&.cm-draftly.cm-focused": {
    outline: "none"
  }
};
var resolveBaseStyles = createTheme({
  default: { ...sharedStyles, "&.cm-draftly": { ...sharedStyles["&.cm-draftly"], ...lightTokens } },
  dark: { "&.cm-draftly": darkTokens }
});
function resolveEditorBaseStyles(theme) {
  return { ...resolveBaseStyles(theme), ...editorOnlyStyles };
}
var baseThemeCache = /* @__PURE__ */ new Map();
function draftlyBaseTheme(theme) {
  let extension = baseThemeCache.get(theme);
  if (!extension) {
    extension = view.EditorView.theme(resolveEditorBaseStyles(theme));
    baseThemeCache.set(theme, extension);
  }
  return extension;
}
var markdownResetStyle = language.HighlightStyle.define([
  {
    tag: [
      highlight.tags.heading,
      highlight.tags.strong,
      highlight.tags.emphasis,
      highlight.tags.strikethrough,
      highlight.tags.link,
      highlight.tags.url,
      highlight.tags.quote,
      highlight.tags.list,
      highlight.tags.meta,
      highlight.tags.contentSeparator,
      highlight.tags.labelName
    ],
    color: "inherit",
    fontWeight: "inherit",
    fontStyle: "inherit",
    textDecoration: "none"
  }
]);
var markdownResetExtension = language.syntaxHighlighting(markdownResetStyle, { fallback: false });

exports.ThemeEnum = ThemeEnum;
exports.createTheme = createTheme;
exports.cursorInRange = cursorInRange;
exports.deepMerge = deepMerge;
exports.draftlyBaseTheme = draftlyBaseTheme;
exports.fixSelector = fixSelector;
exports.flattenThemeStyles = flattenThemeStyles;
exports.markdownResetExtension = markdownResetExtension;
exports.resolveBaseStyles = resolveBaseStyles;
exports.resolveEditorBaseStyles = resolveEditorBaseStyles;
exports.selectionOverlapsRange = selectionOverlapsRange;
exports.toggleMarkdownStyle = toggleMarkdownStyle;
//# sourceMappingURL=chunk-PULMPDQL.cjs.map
//# sourceMappingURL=chunk-PULMPDQL.cjs.map