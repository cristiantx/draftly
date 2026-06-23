'use strict';

var highlight = require('@lezer/highlight');
var langMarkdown = require('@codemirror/lang-markdown');
var languageData = require('@codemirror/language-data');
var DOMPurify = require('dompurify');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var DOMPurify__default = /*#__PURE__*/_interopDefault(DOMPurify);

// src/preview/default-renderers.ts
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var renderDocument = (_node, children) => {
  return children;
};
var defaultRenderers = {
  // Document structure
  Document: renderDocument
};
var MAX_WALK_DEPTH = 8;
function generateSyntaxThemeCSS(syntaxTheme, _wrapperClass) {
  if (!syntaxTheme) return "";
  const styles = extractRuntimeHighlightStyles(syntaxTheme);
  if (!styles.length) return "";
  const cssChunks = [];
  for (const style of styles) {
    const rules = style.module?.getRules();
    if (!rules) continue;
    cssChunks.push(rules);
  }
  if (!cssChunks.length) return "";
  return Array.from(new Set(cssChunks)).join("\n");
}
function resolveSyntaxHighlighters(syntaxTheme, includeLegacyClassHighlighter = true) {
  const resolved = [];
  if (includeLegacyClassHighlighter) {
    resolved.push(highlight.classHighlighter);
  }
  const styles = extractRuntimeHighlightStyles(syntaxTheme);
  for (const style of styles) {
    if (typeof style.style === "function") {
      resolved.push(style);
    }
  }
  return Array.from(new Set(resolved));
}
function extractRuntimeHighlightStyles(input) {
  if (!input) return [];
  const values = Array.isArray(input) ? input : [input];
  const styles = [];
  const visited = /* @__PURE__ */ new WeakSet();
  for (const value of values) {
    walk(value, 0, visited, styles);
  }
  return styles;
}
function walk(value, depth, visited, out) {
  if (value === null || value === void 0) return;
  if (depth > MAX_WALK_DEPTH) return;
  if (isRuntimeHighlightStyle(value)) {
    out.push(value);
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      walk(item, depth + 1, visited, out);
    }
    return;
  }
  if (typeof value !== "object") return;
  if (visited.has(value)) return;
  visited.add(value);
  const keys = Object.getOwnPropertyNames(value);
  for (const key of keys) {
    try {
      walk(value[key], depth + 1, visited, out);
    } catch {
    }
  }
}
function isRuntimeHighlightStyle(value) {
  if (!value || typeof value !== "object") return false;
  const style = value;
  return Array.isArray(style.specs) && typeof style.style === "function";
}
function createPreviewContext(doc, theme, renderChildren, sanitizeHtml = true, syntaxHighlighters = []) {
  return {
    doc,
    theme,
    syntaxHighlighters,
    sliceDoc(from, to) {
      return doc.slice(from, to);
    },
    sanitize(html) {
      if (!sanitizeHtml) return html;
      if (typeof window !== "undefined") {
        return DOMPurify__default.default.sanitize(html);
      }
      return html;
    },
    renderChildren
  };
}

// src/preview/renderer.ts
var PreviewRenderer = class {
  doc;
  theme;
  plugins;
  markdown;
  sanitizeHtml;
  syntaxTheme;
  renderers;
  ctx;
  nodeToPlugins;
  constructor(doc, plugins = [], markdown2, theme = "auto" /* AUTO */, sanitize = true, syntaxTheme) {
    this.doc = doc;
    this.theme = theme;
    this.plugins = plugins;
    this.markdown = markdown2;
    this.sanitizeHtml = sanitize;
    this.syntaxTheme = syntaxTheme;
    this.renderers = { ...defaultRenderers };
    const syntaxHighlighters = resolveSyntaxHighlighters(this.syntaxTheme, true);
    this.ctx = createPreviewContext(doc, theme, this.renderChildren.bind(this), sanitize, syntaxHighlighters);
    this.nodeToPlugins = this.buildNodePluginMap();
  }
  /**
   * Build a map from node names to plugins that handle them
   */
  buildNodePluginMap() {
    const map = /* @__PURE__ */ new Map();
    for (const plugin of this.plugins) {
      if (plugin.renderToHTML && plugin.requiredNodes.length > 0) {
        for (const nodeName of plugin.requiredNodes) {
          const list = map.get(nodeName) || [];
          list.push(plugin);
          map.set(nodeName, list);
        }
      }
    }
    return map;
  }
  /**
   * Render the document to HTML
   */
  async render() {
    const extensions = [
      ...this.markdown,
      ...this.plugins.map((p) => p.getMarkdownConfig()).filter((ext) => ext !== null)
    ];
    const markdownSupport = langMarkdown.markdown({
      base: langMarkdown.markdownLanguage,
      codeLanguages: languageData.languages,
      extensions,
      addKeymap: true,
      completeHTMLTags: true,
      pasteURLAsLink: true
    });
    const parser = markdownSupport.language.parser;
    const tree = parser.parse(this.doc);
    return await this.renderNode(tree.topNode);
  }
  /**
   * Render a single node to HTML
   */
  async renderNode(node) {
    const plugins = this.nodeToPlugins.get(node.name);
    if (plugins) {
      for (const plugin of plugins) {
        const children = await this.renderChildren(node);
        const result = await plugin.renderToHTML(node, children, this.ctx);
        if (result !== null) {
          return result;
        }
      }
    }
    const renderer = this.renderers[node.name];
    if (renderer) {
      const children = await this.renderChildren(node);
      return renderer(node, children, this.ctx);
    }
    if (node.firstChild) {
      return await this.renderChildren(node);
    }
    return this.ctx.sliceDoc(node.from, node.to);
  }
  /**
   * Render all children of a node, including text between nodes
   */
  async renderChildren(node) {
    let result = "";
    let pos = node.from;
    let child = node.firstChild;
    while (child) {
      if (child.from > pos) {
        result += escapeHtml(this.ctx.sliceDoc(pos, child.from));
      }
      result += await this.renderNode(child);
      pos = child.to;
      child = child.nextSibling;
    }
    if (pos < node.to) {
      result += escapeHtml(this.ctx.sliceDoc(pos, node.to));
    }
    return result;
  }
};

exports.PreviewRenderer = PreviewRenderer;
exports.defaultRenderers = defaultRenderers;
exports.escapeHtml = escapeHtml;
exports.generateSyntaxThemeCSS = generateSyntaxThemeCSS;
//# sourceMappingURL=chunk-KTTVXTSR.cjs.map
//# sourceMappingURL=chunk-KTTVXTSR.cjs.map